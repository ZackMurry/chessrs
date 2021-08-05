import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import * as React from 'react'
import Layout from '../components/Layout'
import { Helmet } from 'react-helmet'
import { StaticImage } from 'gatsby-plugin-image'
import './index.css'

const IndexPage = () => {
  return (
    <Layout>
      <Helmet title='Spaced Repetition for Chess Openings — ChesSRS' />
      <main>
        {/* navbar */}
        <Box w='100%' h='80vh' className='gradient-heading' pb='100px'>
          <Flex h='15%' p='20px'>
            <Heading as='h4' color='whiteText'>
              ChesSRS
            </Heading>
          </Flex>
          <Flex w='100%' h='85%' justifyContent='center' alignItems='center' flexDir='column' pb='100px'>
            <Heading as='h1' color='whiteText' opacity='.9' fontSize='60px'>
              Spaced Repetition for Chess Openings
            </Heading>
            <Heading as='h6' color='whiteText' opacity='.8' fontSize='36px' mt='1%'>
              Learn a repertoire using a proven technique for memory efficiency
            </Heading>
          </Flex>
        </Box>
        {/* <Box m='10px auto'>
          <StaticImage
            quality={100}
            src='../images/app_preview.png'
            width={700}
            formats={['auto']}
            alt='A preview of the ChesSRS app'
          />
        </Box> */}
        <Box h='200vh' />
      </main>
    </Layout>
  )
}

export default IndexPage
