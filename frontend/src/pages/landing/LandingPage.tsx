import { FC } from 'react'

const LandingPage: FC = () => (
  <div className='w-full px-6 sm:px-12 lg:px-[0%] xl:px-[15%]'>
    <div className='flex justify-between align-center py-3 bg-white sm:px-12 md:px-[15%]'>
      <a href='/'>
        <div className='flex justify-start align-center'>
          <img
            src='/logo512.png'
            alt='Canvas Sync for Notion logo'
            width={512}
            height={512}
          />
          <h2
            className={`${display.className} my-auto text-xl font-bold text-black`}
          >
            Canvas Sync
          </h2>
        </div>
      </a>
      <div className='flex justify-between align-center space-x-8 my-auto'>
        <Link href='/pricing'>Pricing</Link>
        <Link href='/faq'>FAQ</Link>
        <Link href='/about'>About</Link>
        {/* todo: change to button */}
        <Link
          href={`https://api.notion.com/v1/oauth/authorize?client_id=${oauthClientId}&response_type=code&owner=user`}
        >
          Login
        </Link>
      </div>
    </div>
    <section className='md:px-20'>
      <h1 className='text-center text-6xl font-bold pt-20 text-white'>
        Study chess openings using science
      </h1>
    </section>
  </div>
)

export default LandingPage
