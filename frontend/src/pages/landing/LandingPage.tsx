import LichessSignInButton from 'components/landing/LichessSignInButton'
import { FC } from 'react'
import { useHistory } from 'react-router-dom'

const LandingPage: FC = () => {
  const history = useHistory()

  const demoLogin = () =>
    fetch('/api/v1/auth/demo', { method: 'POST', credentials: 'include' }).then(
      () => history.push('/home'),
    )

  return (
    <div className='bg-[#1f2224] min-h-[2000px]'>
      <div className='flex justify-between align-center py-3 sm:px-12 md:px-[20%]'>
        <a href='/'>
          <div className='flex justify-start align-center'>
            <img
              src='/whitePawn.png'
              alt='Canvas Sync for Notion logo'
              // className='-mt-2'
              width={48}
              height={48}
            />
            <h2 className='font-redhat my-auto text-xl font-bold text-white pt-2'>
              Chessrs
            </h2>
          </div>
        </a>
        <div className='flex justify-between align-center space-x-8 my-auto text-white'>
          <a
            href='https://github.com/ZackMurry/chessrs'
            target='_blank'
            rel='noopener noreferrer'
          >
            GitHub
          </a>
          {/* todo: change to button */}
          <a href='/api/v1/oauth2/code/lichess'>Login</a>
        </div>
      </div>
      <div className='w-full px-6 sm:px-12 lg:px-[0%] xl:px-[15%]'>
        <section className='md:px-20'>
          <h1 className='text-center text-6xl font-bold pt-36 text-white pb-5'>
            Study chess openings using science
          </h1>
          <div className='lg:px-[15%] xl:px-[20%] mb-4 mt-1'>
            <h3 className='text-center text-gray-200 text-xl'>
              Chessrs uses spaced repetition algorithms to model your memory and
              schedule reviews accordingly.
            </h3>
            <div className='w-full flex justify-center my-7'>
              <div>
                <LichessSignInButton />
                <div className='w-full flex justify-center'>
                  <button
                    onClick={demoLogin}
                    className='text-gray-400 text-center mt-2 text-sm underline cursor-pointer'
                  >
                    Or use a temporary account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <img
        src='/create-page.png'
        alt='Create page screenshot'
        className='scale-[0.6]'
      />
    </div>
  )
}

export default LandingPage
