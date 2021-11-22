import { Container } from '@components/commons/Container'
import { useSelector } from 'react-redux'
import { RootState } from '@store/index'
import { UnitSuffix } from '@components/commons/UnitSuffix'
import ReactNumberFormat from 'react-number-format'
import React from 'react'
import { IoSearchSharp } from 'react-icons/io5'
import { useRouter } from 'next/router'
import { useNetwork } from '@contexts/NetworkContext'
import { StatItem } from '@components/commons/stats/StatItem'
import { StatsBar } from '@components/commons/stats/StatsBar'

export function IndexHeader (): JSX.Element {
  return (
    <>
      <Stats />
      <div
        className='flex flex-col items-center'
        style={{ backgroundImage: 'linear-gradient(to bottom left, #FFFFFF, #fff7f4,  #f7e6f0' }}
      >
        <Container className='h-full'>
          <div className='h-full flex flex-wrap items-center justify-center mt-14 mb-16'>
            <h1 className='text-3xl lg:text-4xl mb-6 font-semibold text-center' data-testid='Header.title'>
              DeFiChain Blockchain Explorer
            </h1>
            <SearchBar />
          </div>
        </Container>
      </div>
    </>
  )
}

function SearchBar (): JSX.Element {
  const router = useRouter()
  const connection = useNetwork().connection

  return (
    <div className='flex w-full lg:w-2/3 items-center'>
      <div className='flex w-full p-2 rounded-3xl h-10 bg-white border border-primary-100'>
        <IoSearchSharp size={22} className='text-gray-400 ml-0.5 self-center' />
        <input
          onKeyDown={(event) => event.key === 'Enter' && router.push(`/search/${(event.target as HTMLInputElement).value}?network=${connection}`)}
          placeholder='Search by Transaction ID, Block Hash, Block Height or Address'
          className='ml-1.5 w-full focus:outline-none'
          data-testid='IndexHeader.SearchInput'
        />
      </div>
    </div>
  )
}

function Stats (): JSX.Element {
  const stats = useSelector((state: RootState) => state.stats)

  return (
    <StatsBar>
      <StatItem label='Price' testId='StatItem.priceUsdt'>
        <ReactNumberFormat
          displayType='text'
          thousandSeparator
          value={stats.price.usdt}
          decimalScale={2}
          prefix='$'
          suffix=' USD'
        />
      </StatItem>
      <StatItem label='Total Value Locked (TVL)' testId='StatItem.tvlTotal'>
        <ReactNumberFormat
          displayType='text'
          thousandSeparator
          value={stats.tvl.total}
          decimalScale={0}
          prefix='$'
          suffix=' USD'
        />
      </StatItem>
      <StatItem label='Total DFI Burned' testId='StatItem.totalDFIBurned'>
        <UnitSuffix
          value={stats.burned.total}
          units={{
            3: 'K',
            6: 'M',
            9: 'G',
            12: 'T'
          }}
        />
        <span className='ml-1'>DFI</span>
      </StatItem>
      <StatItem label='Block Reward' testId='StatItem.blockReward'>
        <ReactNumberFormat
          displayType='text'
          thousandSeparator
          value={stats.emission.total}
          decimalScale={2}
        />
        <span className='ml-1'>DFI</span>
      </StatItem>
      <StatItem label='Difficulty' testId='StatItem.difficulty'>
        <UnitSuffix
          value={stats.blockchain.difficulty}
          units={{
            3: 'K',
            6: 'M',
            9: 'G',
            12: 'T'
          }}
        />
      </StatItem>
    </StatsBar>
  )
}
