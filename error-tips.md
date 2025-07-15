### 에러 메시지 해설  
**"Dependencies lock file is not found in /home/runner/work/Blog/Blog. Supported file patterns: pnpm-lock.yaml"**  
이 에러는 GitHub Actions 등 CI(지속적 통합) 환경에서 `pnpm`을 사용해 의존성 설치를 시도할 때, 해당 디렉터리에 `pnpm-lock.yaml` 파일이 존재하지 않아 발생합니다.

#### 원인  
- `pnpm`은 의존성 버전 고정을 위해 `pnpm-lock.yaml` 파일이 반드시 필요합니다.
- CI 환경에서는 보통 `pnpm install --frozen-lockfile` 옵션이 자동 적용되는데, 이 옵션은 lock 파일이 없거나, 패키지 목록과 불일치할 경우 설치를 중단합니다[1][2][3].
- 즉, `/home/runner/work/Blog/Blog` 경로에 `pnpm-lock.yaml` 파일이 없기 때문에 의존성 설치가 실패한 것입니다.

#### 주요 발생 상황  
- 레포지토리에 `pnpm-lock.yaml` 파일이 커밋되지 않은 경우
- 워크플로우에서 잘못된 경로를 참조하는 경우
- 패키지 매니저 변경(npm → pnpm 등) 후 lock 파일을 새로 만들지 않은 경우

### 해결 방법

1. **pnpm-lock.yaml 파일 생성 및 커밋**
   - 로컬에서 아래 명령어 실행:
     ```bash
     pnpm install
     ```
   - 이 과정에서 `pnpm-lock.yaml` 파일이 생성됩니다.
   - 해당 파일을 Git에 커밋(push)하세요.

2. **워크플로우 경로 확인**
   - 워크플로우가 올바른 디렉터리(예: `/home/runner/work/Blog/Blog`)에서 실행되고 있는지 확인하세요[4][5].

3. **패키지 매니저 버전 일치**
   - 로컬과 CI 환경의 pnpm 버전이 다르면 lock 파일 호환성 문제가 발생할 수 있습니다. 워크플로우에서 `pnpm/action-setup`을 사용해 동일한 버전을 명시하세요[6][2][7].
     ```yaml
     - uses: pnpm/action-setup@v4
       with:
         version: 10 # 예시
     ```

4. **lock 파일이 이미 있는데도 에러가 난다면**
   - lock 파일이 손상됐거나, 버전 호환성 문제가 있을 수 있습니다.  
     이런 경우, lock 파일을 삭제하고 다시 생성한 후 커밋하세요.
     ```bash
     rm pnpm-lock.yaml
     pnpm install
     git add pnpm-lock.yaml
     git commit -m "fix: regenerate pnpm-lock.yaml"
     git push
     ```

### 참고  
- lock 파일은 협업 및 배포 환경에서 반드시 필요하므로, 항상 최신 상태로 유지하고 커밋하는 것이 좋습니다.
- CI 환경의 로그를 꼼꼼히 확인하여, lock 파일 경로와 패키지 매니저 버전이 올바른지 점검하세요.

**요약:**  
`pnpm-lock.yaml` 파일이 없어서 발생하는 에러입니다.  
로컬에서 `pnpm install`로 lock 파일을 생성하고, Git에 커밋하면 해결됩니다[1][2][3].  
CI 환경과 로컬의 pnpm 버전을 일치시키는 것도 중요합니다.

[1] https://station.railway.com/questions/builds-failing-with-error-pnpm-lock-yaml-74c7f58e
[2] https://dev.classmethod.jp/articles/solved-github-actions-pnpm-lock-yaml-is-absent-error/
[3] https://pnpm.io/ko/continuous-integration
[4] https://github.com/pnpm/action-setup/blob/master/pnpm-lock.yaml
[5] https://velog.io/@zemma0618/GitHub-Actions-Dependencies-lock-file-is-not-found-in-%EC%97%90%EB%9F%AC
[6] https://www.bstefanski.com/blog/how-to-fix-cannot-install-with-frozen-lockfile-because-pnpm-lockyaml-is-absent-in-pnpm
[7] https://github.com/pnpm/pnpm/issues/7114
[8] https://github.com/pnpm/pnpm/issues/4473
[9] https://pnpm.io/ko/errors
[10] https://pnpm.io/ko/cli/install
[11] https://stackoverflow.com/questions/76361624/error-err-pnpm-lockfile-missing-dependency-broken-lockfile-in-pnpm-installati
[12] https://github.com/pnpm/pnpm/issues/1890
[13] https://github.com/wyvox/action/blob/main/pnpm-lock.yaml
[14] https://stackoverflow.com/questions/77108266/err-pnpm-config-conflict-lockfile-only-with-no-lockfile-cannot-generate-a-pnpm-l
[15] https://stackoverflow.com/questions/76869615/next-js-how-to-fix-err-pnpm-outdated-lockfile
[16] https://github.com/pnpm/pnpm/issues/6312
[17] https://pnpm.io/cli/install
[18] https://pnpm.io/ko/next/continuous-integration
[19] https://dkfma6033.tistory.com/234
[20] https://forum.finsweet.com/t/lockfile-error-when-pushing-my-code-to-npm/2904
