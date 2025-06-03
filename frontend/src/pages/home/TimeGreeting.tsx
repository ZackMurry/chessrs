interface Props {
  userName: string
}

const TimeBasedGreeting: React.FC<Props> = ({ userName }) => {
  const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <h1 className='mb-5 text-offwhite text-3xl font-bold'>
      {getGreeting()}, {userName}!
    </h1>
  )
}

export default TimeBasedGreeting
