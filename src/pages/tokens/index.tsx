import { GetServerSidePropsContext, GetServerSidePropsResult, InferGetServerSidePropsType } from 'next'
import { useState } from 'react'

import { getWhaleApiClient } from '@contexts/WhaleContext'
import { TokenData } from '@defichain/whale-api-client/dist/api/tokens'
import { tokens } from '@defichain/whale-api-client'

import { AdaptiveTable } from '@components/commons/AdaptiveTable'
import { getTokenIcon } from '@components/icons/tokens'
import { Head } from '@components/commons/Head'

interface TokensPageData {
  tokens: {
    items: tokens.TokenData[]
    nextToken: string | null
  }
}

export default function TokensPage ({ tokens }: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const [items] = useState(tokens.items)

  return (
    <div className='container mx-auto px-4 pt-12 pb-20'>
      <Head
        title='Tokens'
      />
      <h1 className='text-2xl font-semibold'>Tokens</h1>
      <AdaptiveTable className='mt-6'>
        <AdaptiveTable.Header>
          <AdaptiveTable.Head className='flex items-center'>TOKEN NAME</AdaptiveTable.Head>
          <AdaptiveTable.Head className='text-right'>SYMBOL</AdaptiveTable.Head>
          <AdaptiveTable.Head className='text-right'>CATEGORY</AdaptiveTable.Head>
          <AdaptiveTable.Head className='text-right flex items-center'>MINTED</AdaptiveTable.Head>
        </AdaptiveTable.Header>
        {items.map((data: TokenData) => (
          <TokenRow data={data} key={data.id} />
        ))}
      </AdaptiveTable>
    </div>
  )
}

function TokenRow ({ data }: { data: TokenData }): JSX.Element {
  const TokenIcon = getTokenIcon(data.symbol)
  return (
    <AdaptiveTable.Row>
      <AdaptiveTable.Cell title='TOKEN NAME' className='align-middle'>
        <div className='flex items-center'>
          <TokenIcon className='mr-2' />
          {data.name}
        </div>
      </AdaptiveTable.Cell>
      <AdaptiveTable.Cell title='SYMBOL' className='align-middle lg:text-right'>
        <div>{data.symbol}</div>
      </AdaptiveTable.Cell>
      <AdaptiveTable.Cell title='CATEGORIES' className='align-middle lg:text-right'>
        <div>{data.isDAT ? 'DAT' : 'LPS'}</div>
      </AdaptiveTable.Cell>
      <AdaptiveTable.Cell title='MINTED' className='align-middle lg:text-right'>
        <div>{data.minted}</div>
      </AdaptiveTable.Cell>
    </AdaptiveTable.Row>
  )
}

export async function getServerSideProps (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<TokensPageData>> {
  const items = await getWhaleApiClient(context).tokens.list()
  return {
    props: {
      tokens: {
        items,
        nextToken: items.nextToken ?? null
      }
    }
  }
}
