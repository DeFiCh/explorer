import { IoCloseCircleSharp, IoSearchSharp, IoWalletOutline } from 'react-icons/io5'
import { CgSpinner } from 'react-icons/cg'
import React, { Fragment, PropsWithChildren, useMemo, useState } from 'react'
import { useWhaleApiClient } from '@contexts/WhaleContext'
import debounce from 'lodash.debounce'
import { usePopper } from 'react-popper'
import { Menu, Transition } from '@headlessui/react'
import { Transaction } from '@defichain/whale-api-client/dist/api/transactions'
import { Block } from '@defichain/whale-api-client/dist/api/blocks'
import { fromAddress } from '@defichain/jellyfish-address'
import { useNetwork } from '@contexts/NetworkContext'
import { NetworkName } from '@defichain/jellyfish-network'
import { WhaleApiClient } from '@defichain/whale-api-client'
import { LoanVaultActive, LoanVaultLiquidated } from '@defichain/whale-api-client/dist/api/loan'
import { SearchLink } from '@components/commons/link/Link'
import classNames from 'classnames'
import { Modifier } from '@popperjs/core'
import { MdShield, MdStairs, MdSwapHorizontalCircle } from 'react-icons/md'

interface SearchBarInterface {
  collapsable: boolean
}

interface SearchResult {
  url: string
  title: string
  type: string
}

export function SearchBar (props: SearchBarInterface): JSX.Element {
  const api = useWhaleApiClient()
  const network = useNetwork().name

  const [isActive, setIsActive] = useState<boolean>(false)
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [searchResults, setSearchResults] = useState<SearchResult[] | undefined>(undefined)
  const [refEle, setRefEle] = useState<any>()
  const [popperEle, setPopperEle] = useState<any>()

  const widthModifier = useMemo((): Modifier<string, Record<string, unknown>> => (
    {
      name: 'matchReferenceSize',
      enabled: true,
      fn: ({
        state,
        instance
      }) => {
        const popperSize = popperEle.offsetWidth
        const referenceSize = state.rects.reference.width

        if (Math.round(popperSize) === Math.round(referenceSize)) {
          return
        }

        popperEle.style.width = `${referenceSize}px`
        void instance.update()
      },
      phase: 'beforeWrite',
      requires: ['computeStyles']
    }
  ), [popperEle]
  )

  const {
    styles,
    attributes
  } = usePopper(refEle, popperEle, {
    placement: 'bottom',
    modifiers: [widthModifier]
  })

  async function changeHandler (event): Promise<void> {
    const query = event.target.value.trim()

    if (query.length > 0) {
      setIsSearching(true)
      const results = await getSearchResults(api, network, query)
      setSearchResults(results)
      setIsSearching(false)
    } else {
      setSearchResults([])
    }
  }

  const onChangeDebounceHandler = useMemo(() => debounce(changeHandler, 200), [])

  return (
    <Menu as={Fragment}>
      <div className={classNames('flex w-full md:w-3/4 xl:w-1/2')}>
        <div
          className={`flex w-full p-2 rounded-3xl h-10 bg-white border ${isActive ? 'border-primary-200' : ''}`}
          data-testid='SearchBar'
          ref={setRefEle}
        >
          <IoSearchSharp size={22} className='text-gray-600 ml-0.5 self-center' />
          <Menu.Button as={Fragment}>
            <input
              onChange={onChangeDebounceHandler}
              onFocus={() => setIsActive(true)}
              onBlur={() => {
                setIsActive(false)
              }}
              placeholder='Search Block / Txn / Vault ID and more'
              className='ml-1.5 w-full focus:outline-none'
              data-testid='SearchBar.Input'
              autoFocus={props.collapsable}
            />
          </Menu.Button>
        </div>

        <Transition
          enter='transition ease-in duration-150'
          enterFrom='opacity-0 translate-y-1'
          enterTo='opacity-100 translate-y-0'
          leave='transition ease-in duration-150'
          leaveFrom='opacity-100 translate-y-0'
          leaveTo='opacity-0 translate-y-1'
          show={isActive || (searchResults !== undefined && searchResults.length > 0)}
        >
          <div className='w-full z-40' ref={setPopperEle} style={styles.popper} {...attributes.popper}>
            <div className='w-full mt-1.5 pt-1 rounded-md shadow-lg filter drop-shadow bg-white z-10 overflow-hidden'>
              <SearchResultTable searchResults={searchResults} isSearching={isSearching} />
            </div>
          </div>
        </Transition>
      </div>
    </Menu>
  )
}

function SearchResultTable (props: { searchResults?: SearchResult[], isSearching: boolean }): JSX.Element {
  if (props.isSearching) {
    return (
      <SearchStatusMessage message='Searching'>
        <CgSpinner size={52} className='animate-spin text-gray-600' />
      </SearchStatusMessage>
    )
  }

  if (props.searchResults === undefined) {
    return (
      <SearchStatusMessage message='Search by Transaction ID, Block Hash, Block Height or Address'>
        <IoSearchSharp size={96} className='text-gray-400 opacity-30' />
      </SearchStatusMessage>
    )
  }

  if (props.searchResults.length === 0) {
    return (
      <SearchStatusMessage message='No Results'>
        <IoCloseCircleSharp size={88} className='text-gray-400 opacity-30' />
      </SearchStatusMessage>
    )
  }

  return (
    <>
      <Menu.Items className='focus:outline-none'>
        {props.searchResults.map((searchResult, index) => {
          return (
            <SearchResultRow searchResults={searchResult} index={index} key={searchResult.title} />
          )
        })}
      </Menu.Items>
    </>
  )
}

function SearchResultRow (props: { searchResults: SearchResult, index: number }): JSX.Element {
  return (
    <>
      <Menu.Item as='div' disabled>
        <div className='flex flex-wrap px-3 py-2 pb-0 text-gray-900 font-medium justify-center'>
          <div className={classNames('w-full text-sm mb-0.5', { 'border-t pt-4': props.index !== 0 })}>
            {props.searchResults.type === 'Block' && 'Blocks'}
            {props.searchResults.type === 'Transaction' && 'Transactions'}
            {props.searchResults.type === 'Address' && 'Addresses'}
            {props.searchResults.type === 'Vault' && 'Vaults'}
          </div>
        </div>
      </Menu.Item>
      <Menu.Item as={Fragment}>
        {({ active }) => (
          <SearchLink href={{ pathname: props.searchResults.url }}>
            <div
              className={classNames('bg-white px-3 py-2 cursor-pointer', { 'bg-primary-50 ': active })}
              data-testid={`SearchResultRow.${props.searchResults.type}.${props.searchResults.title}`}
            >
              <div className='flex flex-row items-center gap-x-2'>
                <div className='text-primary-500'>
                  {props.searchResults.type === 'Block' && <MdStairs size={20} />}
                  {props.searchResults.type === 'Transaction' && <MdSwapHorizontalCircle size={20} />}
                  {props.searchResults.type === 'Address' && <IoWalletOutline size={20} />}
                  {props.searchResults.type === 'Vault' && <MdShield size={20} />}
                </div>
                <div className='overflow-hidden'>
                  <div className='overflow-hidden overflow-ellipsis'>{props.searchResults.title}</div>
                </div>
              </div>
            </div>
          </SearchLink>
        )}
      </Menu.Item>
    </>
  )
}

async function getSearchResults (api: WhaleApiClient, network: NetworkName, query: string): Promise<(SearchResult[])> {
  const searchResults: SearchResult[] = []

  const txnData = await api.transactions.get(query)
    .then((data: Transaction) => {
      if (data === undefined) {
        return undefined
      }

      return {
        url: `/transactions/${data.txid}`,
        title: data.txid,
        type: 'Transaction'
      }
    })
    .catch(() => {
      return undefined
    })

  if (txnData !== undefined) {
    searchResults.push(txnData)
  }

  const blocksData = await api.blocks.get(query)
    .then((data: Block) => {
      if (data === undefined) {
        return undefined
      }

      return {
        url: `/blocks/${data.id}`,
        title: `${data.height}`,
        type: 'Block'
      }
    }).catch(() => {
      return undefined
    })

  if (blocksData !== undefined) {
    searchResults.push(blocksData)
  }

  const addressData = fromAddress(query, network)
  if (addressData !== undefined) {
    searchResults.push({
      url: `/address/${query}`,
      title: query,
      type: 'Address'
    })
  }

  const vaultsData = await api.loan.getVault(query)
    .then((data: LoanVaultActive | LoanVaultLiquidated) => {
      if (data === undefined) {
        return undefined
      }

      return {
        url: `/vaults/${data.vaultId}`,
        title: `${data.vaultId}`,
        type: 'Vault'
      }
    }).catch(() => {
      return undefined
    })

  if (vaultsData !== undefined) {
    searchResults.push(vaultsData)
  }

  return searchResults
}

function SearchStatusMessage (props: PropsWithChildren<{ message: string }>): JSX.Element {
  return (
    <div className='w-full rounded mt-1 bg-white p-2'>
      <div className='w-full flex flex-col bg-white items-center'>
        {props.children}
        <span className='text-center text-gray-400'>{props.message}</span>
      </div>
    </div>
  )
}
