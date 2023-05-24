NextMarket 기술 선택

1. Typescript -> Type 지정을 통해 체계적인 코드 관리 및 컴파일 단계에서 오류를 잡아서 더 나은 개발 속도를 위해 선택

2. planetscale을 통해 서버리스 db를 생성

3. db에 더 간결하게 통신하기 위해 prsima를 이용
   prisma -> Typescript 기반 ORM

4. 메인 디비에 스키마 추가

5. Tailwind CSS 적용 -> 원하는 특정 컴포넌트에만 스타일을 적용시켜서, 빠르게 스타일링을 하기위해

6. Emotion(Css in Js) 추가 -> css가 가진 문제점을 보완하기 위해

   - 프로젝트가 커지고 css파일이 커짐에 따라 내가 만든 namespace를 침범할 경우가 생길 수 있음
   - 특정 div에만 적용되는 경우의 문제 등
   - 특정 css 정의를 사용하지 않음에도 그 정의가 속한 파일을 로드해야됨
     -> 이러한 문제점들을 보완하기 위해 emotion 적용

7. react-image-gallery 라이브러리 사용 -> 하지만 내가 원하는 next의 Image를 쓰기가 용이하지 않다.
   nuka-carousel 사용 -> hostname "picsum.photos" is not configured under images in your `next.config.js` 오류 발생, next.config.js 파일에 아래 내용 추가하여 해결
   ```javascript
   images: {
     domains: ["picsum.photos"];
   }
   ```
8. bot을 위해 robot.txt와 sitemap 설정, 배포 후 설정을 위한 robots.txt파일과 sitemap.xml 파일 생성

9. react-draft-wysiwyg 라이브러리 사용
   -> body를 통해 텍스트에디터에서 작성한 내용을 db로 보내려 했지만 오류 발생
   -> 내가 작성한 내용을 통신으로 주고받기 위해선 raw한 데이터로 바꿔야 한다. 그리고 그 데이터는 string이 아닌 객체이기 때문. --> contents를 raw로 - raw를 stringify

   - 내가 작성할 때는 string을 json으로 파싱 -> 그걸 raw로 바꾸고 contents로 변경
     -> 그래서 JSON.stringify로 한번 감싸주고 요청했더니 정상적으로 보내졌다.

   ```javascript
   body: JSON.stringify({
     id: id,
     contents: JSON.stringify(convertToRaw(editorState.getCurrentContent())),
   });
   ```

   -> 정상적으로 보내지긴 했지만 업데이트는 안됨.
   -> body로 보내고 있는 값을 json형태로 파싱해주지 않아서 생긴 문제, 파싱 후 요청하니 업데이트 성공

   ```javascript
   const { id, contents } = JSON.parse(req.body);
   ```

10. ts-node를 활용하여 db에 상품목록을 집어넣어서 상품목록 구현
    -> ts-node는 cli 상에서 ts 파일을 실행해주는 도구

11. mantine UI 사용 -> 손쉽게 페이지네이션 디자인이나 컴포넌트 디자인을 하기 위해

12~13 -> input 이벤트 최적화, 조회에 캐시 활용 12. 검색 기능에 debounce 추가 -> 사용자가 input에 입력할 때마다 검색 목록을 조회해 온다 -> 서버에 부담이 커질거라고 예상됨 -> debounce를 통해 검색 조회에 delay를 설정해서 서버 부담을 줄임

13. 캐싱을 위해 react-query 사용 -> 기존에는 똑같은 요청에 대해서 계속 db조회를 해왔음. 이걸 방지하기 위해 사용 -> 검색한 결과물들을 캐싱하여 나중에 다시 조회한다 하더라도 api 요청을 다시 보내지 않는다

14. 리액트 쿼리를 이용하여 두번 요청이 되던걸 한번으로 줄임
    -> 기존에는 useEffect를 활용하여 페이지 mount 시에 요청하는걸로 했지만 이런 경우 두번 요청이 되어짐
    -> 불필요한 요청을 없애기 위해 react-query를 이용하여 한번만 요청하는걸로 변경

```typescript
// 기존에 사용하던 방법
const [categories, setCategories] = useState<categories[]>([]);
const [selectedCategory, setSelectedCategory] = useState<string>("-1");

useEffect(() => {
  fetch(`/api/get-categories`)
    .then((res) => res.json())
    .then((data) => setCategories(data.items));
}, []);
useEffect(() => {
    fetch(
      `/api/get-products-count?category=${selectedCategory}&contains=${debouncedSearch}`
    )
      .then((res) => res.json())
      .then((data) => setTotal(Math.ceil(data.items / Take)));
  }, [selectedCategory, debouncedSearch]);



  ======================================================
  // react-query를 이용해 변경한 방법
  const { data: categories } = useQuery<
    { items: categories[] },
    unknown,
    categories[]
  >(
    ["/api/get-categories"],
    () => fetch(`/api/get-categories`).then((res) => res.json()),
    { select: (data) => data.items }
  );

  const { data: total } = useQuery(
    [
      "/api/get-products-count?category=${selectedCategory}&contains=${debouncedSearch}",
    ],
    () =>
      fetch(
        `/api/get-products-count?category=${selectedCategory}&contains=${debouncedSearch}`
      ).then((res) => res.json()),
    { select: (data) => data.items }
  );
```

15. 회원가입 및 로그인
