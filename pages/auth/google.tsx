import { GoogleLogin } from "@react-oauth/google";

function Google() {
  return (
    <div style={{ display: "flex" }}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          fetch(`/api/auth/sign-in?credential=${credentialResponse.credential}`)
            .then((res) => res.json())
            .then((data) => console.log(data));
        }}
        onError={() => {

        }}
      />
    </div>
  );
}

export default Google;
