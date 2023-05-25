import GoogleLogin from '@/components/GoogleLogin'
import React from 'react'

function Login() {
  return (
    <div style={{
        display:'flex',
        width:'100vw',
        height:'100vh',
        alignItems:'center',
        justifyContent:'center'
    }}>
        <GoogleLogin/>
    </div>
  )
}

export default Login