## 📝 [Trouble Shooting] JPA 더티 체킹 미작동 이슈 (닉네임 변경)

### 1. 문제 상황 (Issue)

* **상황**: 펫의 닉네임을 변경하는 API를 호출했으나, DB에 변경 사항이 반영되지 않음.
* **현상**: `@Transactional` 어노테이션을 사용했고 엔티티의 필드 값을 수정했음에도 불구하고, 콘솔에 `UPDATE` 쿼리가 발생하지 않음.

### 2. 원인 분석 (Root Cause)

이 문제는 **준영속(Detached) 상태의 엔티티** 때문에 발생했습니다.

* `@AuthenticationPrincipal`을 통해 인자값으로 받은 `User` 객체는 세션이나 토큰 기반으로 생성된 객체로, 현재의 트랜잭션과 연결된 **영속성 컨텍스트(Persistence Context)** 가 관리하는 상태가 아님.
* JPA의 **더티 체킹(Dirty Checking)** 은 영속성 컨텍스트에 포함된 '영속 상태'의 엔티티에만 적용됨.
* 따라서 관리 대상이 아닌 `User` 객체의 값을 아무리 변경해도, 트랜잭션 종료 시점에 하이버네이트는 변경을 감지하지 못하고 쿼리를 생성하지 않음.

### 3. 해결 방안 (Resolution)

영속성 컨텍스트가 엔티티를 관리하도록 **다시 조회(Select)** 하여 영속 상태로 만든 뒤 수정함.

```java
@Transactional
public void changePetNickname(String nickname, User user) {
    // 1. 유효성 검사
    if (nickname == null || nickname.isBlank()) {
        throw new IllegalArgumentException("닉네임은 비어있을 수 없습니다.");
    }

    // 2. 영속성 컨텍스트에 유저를 로드 (Managed 상태로 전환)
    User managedUser = userRepository.findById(user.getId())
            .orElseThrow(() -> new EntityNotFoundException("유저를 찾을 수 없습니다."));

    // 3. 비즈니스 로직 수행 (영속 상태의 엔티티 필드 수정)
    managedUser.getPet().changeNickname(nickname);
    
    // 4. 트랜잭션 종료 시 자동 UPDATE 쿼리 발생 (Dirty Checking)
}

```

### 4. 배운 점 (Key Takeaways)

1. **영속성 컨텍스트의 중요성**: 엔티티의 상태(영속/준영속)를 정확히 파악해야 JPA의 기능을 100% 활용할 수 있음.
2. **데이터 무결성**: 단순히 인자로 받은 객체를 믿기보다, 서비스 계층에서 다시 조회함으로써 가장 최신 데이터를 안전하게 수정할 수 있음을 확인.
3. **데메테르 법칙과 객체 지향**: `user.getPet().changeNickname()`처럼 객체에 메시지를 보내 스스로 상태를 변경하게 하는 설계가 유지보수에 유리함.

---

