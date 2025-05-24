import React, { FC } from 'react'

// The OAuth client ID from the integration page!
export const oauthClientId = '18bd872b-594c-806c-9912-0037f79b8fde'

const LichessSignInButton: FC = () => {
  const handleSignIn = () => {
    window.location.href = '/api/v1/oauth2/code/lichess'
  }

  return (
    <button
      onClick={handleSignIn}
      className='flex items-center gap-2 px-4 py-2 border border-white border-2 rounded-lg shadow-sm bg-[#fefefe] hover:bg-gray-100 transition'
    >
      <img src='/lichess-logo.png' alt='Lichess logo' width='42' height='42' />
      <span className='font-medium'>Continue with Lichess</span>
    </button>
  )
}

export default LichessSignInButton
