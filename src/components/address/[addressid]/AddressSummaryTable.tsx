import { useSelector } from 'react-redux'
import { RootState } from '@store/index'
import { AdaptiveList } from '@components/commons/AdaptiveList'
import BigNumber from 'bignumber.js'
import { AddressAggregation, AddressToken } from '@defichain/whale-api-client/dist/api/address'
import { TokenSymbol } from '@components/commons/TokenSymbol'

interface AddressSummaryTableProps {
  aggregation: AddressAggregation
  tokens: AddressToken[]
}

export function AddressSummaryTable (props: AddressSummaryTableProps): JSX.Element {
  const { count: { blocks } } = useSelector((state: RootState) => state.stats)
  const confirmations = blocks !== undefined ? blocks - props.aggregation.block.height : blocks

  return (
    <div className='mt-5 flex flex-col space-y-6 items-start lg:flex-row lg:space-x-8 lg:space-y-0'>
      <div className='w-full lg:w-1/2'>
        <AdaptiveList>
          <AdaptiveList.Row name='Balance' className='text-left' testId='SummaryTableListLeft.balance'>
            {new BigNumber(props.aggregation.amount.unspent).toFixed(8)} DFI
            <span className='ml-2'>({confirmations} Confirmations)</span>
          </AdaptiveList.Row>
          <AdaptiveList.Row name='Total Sent' className='text-left' testId='SummaryTableListLeft.balance'>
            {new BigNumber(props.aggregation.amount.txOut).toFixed(8)} DFI
          </AdaptiveList.Row>
          <AdaptiveList.Row name='Total Received' className='text-left' testId='SummaryTableListLeft.balance'>
            {new BigNumber(props.aggregation.amount.txIn).toFixed(8)} DFI
          </AdaptiveList.Row>
          <AdaptiveList.Row
            name='No. of Transaction' className='text-left'
            testId='SummaryTableListLeft.transactionCount'
          >
            {props.aggregation.statistic.txCount}
          </AdaptiveList.Row>
        </AdaptiveList>
      </div>
      <SummaryTableListRight tokens={props.tokens} />
    </div>
  )
}

function SummaryTableListRight (props: {
  tokens: AddressToken[]
}): JSX.Element {
  return (
    <div className='w-full lg:w-1/2'>
      <AdaptiveList>
        <AdaptiveList.Row name='Tokens' testId='SummaryTableListRight.tokens'>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-2.5'>
            {props.tokens.map((token) => {
              return (
                <TokenSymbol
                  tokenId={Number(token.id)} className='ml-1'
                  testId={`SummaryTableListRight.tokens.${token.id}`} key={token.id}
                />
              )
            })}
          </div>
        </AdaptiveList.Row>
      </AdaptiveList>
    </div>
  )
}
