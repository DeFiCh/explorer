import React, { useState } from "react";
import { isPlayground } from "@contexts/Environment";
import { Container } from "@components/commons/Container";
import { CursorPage } from "@components/commons/CursorPagination";
import { getWhaleRpcClient, newPlaygroundClient } from "@contexts/WhaleContext";
import { GetServerSidePropsContext } from "next";
import {
  ListProposalsType,
  ListProposalsStatus,
  ProposalInfo,
  ProposalStatus,
} from "@defichain/jellyfish-api-core/dist/category/governance";
import { useNetwork } from "@contexts/NetworkContext";
import { PlaygroundRpcClient } from "@defichain/playground-api-client";
import classNames from "classnames";
import { Link } from "@components/commons/link/Link";
import { useWindowDimensions } from "hooks/useWindowDimensions";
import { ProposalCards } from "./_components/ProposalCard";
import { ProposalTable } from "./_components/ProposalTable";
import { Button } from "./_components/Button";
import { getCurrentYearMonth } from "./shared/dateHelper";
import { UserQueryProposalStatus } from "./enum/UserQueryProposalStatus";
import {
  getLocalStorageItem,
  setLocalStorage,
} from "./shared/localStorageHelper";

interface OCGProps {
  allProposalsDetails: {
    proposalsSubmitted: number;
    openProposals: number;
    closedProposals: number;
    currentBlockCount: number;
    currentBlockMedianTime: number;
    userQueryProposalType: ListProposalsType;
    userQueryProposalStatus: UserQueryProposalStatus;
  };
  proposals: {
    allProposals: ProposalInfo[];
    queryProposals: ProposalInfo[];
    pages: CursorPage[];
  };
}
export default function OnChainGovernancePage({
  allProposalsDetails,
  proposals,
}: OCGProps) {
  const connection = useNetwork().connection;
  const userQueryProposalStatus = allProposalsDetails.userQueryProposalStatus;
  const userQueryProposalType = allProposalsDetails.userQueryProposalType;
  const isOpenProposalsClicked = userQueryProposalStatus === "open";
  const [masternodeId, setMasterNodeID] = useState(
    getLocalStorageItem("dummyMasternodeID") ?? ""
  );

  const { currentYear, currentMonth } = getCurrentYearMonth();

  // TODO remove this before release to prod
  async function createDummyProposals(): Promise<void> {
    const playgroundRPC = new PlaygroundRpcClient(
      newPlaygroundClient(connection)
    );
    for (let i = 0; i < 5; i += 1) {
      const governanceType = ["creategovvoc", "creategovcfp"];
      const proposalType =
        governanceType[Math.floor(Math.random() * governanceType.length)]; // get random governance type
      const cfpData = {
        title: `Title testing proposal ${new Date().getTime()}`,
        amount: "100000000",
        context: "https://github.com/WavesHQ/scan",
        payoutAddress: "mswsMVsyGMj1FzDMbbxw2QW3KvQAv2FKiy",
        cycles: i + 1,
      };
      const vocData = {
        title: `Title testing proposal ${new Date().getTime()}`,
        context: "https://github.com/WavesHQ/scan",
      };
      const proposal = await playgroundRPC.call(
        proposalType,
        [proposalType === "creategovvoc" ? vocData : cfpData, []],
        "number"
      );
      console.log(
        `proposal created with id:${proposal} is created with ${proposalType}`
      );
    }
  }

  return (
    <div>
      <div className="py-4 bg-gray-50 w-screen">
        <Container>
          <span className="text-gray-900 tracking-[0.0044em]">
            Announcement: {currentMonth} {currentYear} voting round is now
            ongoing.&nbsp;
            <a
              className="text-[#4A72DA] underline"
              href="https://github.com/DeFiCh/dfips/issues/222"
            >
              Read here for more details
            </a>
          </span>
        </Container>
      </div>
      {isPlayground(connection) && (
        <div className="text-center">
          <Button
            testId="dummy-proposal"
            label="Create dummy proposal"
            onClick={createDummyProposals}
            customStyle="bg-primary-50 hover:bg-primary-100 rounded m-4"
          />
          <input
            className="border"
            placeholder="set masternode here"
            value={masternodeId}
            onChange={(v) => {
              setMasterNodeID(v.target.value);
            }}
          />
          <Button
            label="set masternode"
            testId="dummy-submit"
            customStyle="bg-primary-50 hover:bg-primary-100 rounded m-4"
            onClick={() => {
              setLocalStorage("dummyMasternodeID", masternodeId);
            }}
          />
        </div>
      )}

      <Container className="md:pt-11 pt-10 pb-20">
        <div className="flex md:flex-row flex-col">
          <div className="flex flex-col grow md:justify-center">
            {/* main title */}
            <div
              data-testid="OnChainGovernance.Title"
              className="text-[10px] tracking-[0.0015em] font-medium text-gray-500 dark:text-dark-gray-900"
            >
              ON-CHAIN GOVERNANCE
            </div>
            <div
              data-testid="OnChainGovernance.Proposals.Title"
              className="text-4xl leading-[48px] tracking-[0.0015em] font-semibold dark:text-dark-gray-900"
            >
              Proposals
            </div>
          </div>

          {/* Proposal Info Table */}
          <div className="flex flex-col md:mt-0 mt-8">
            <div className="justify-self-center border border-gray-200 rounded-[10px] flex flex-row items-center lg:px-3 py-6 md:h-[104px] h-[84px] md:w-[412px] lg:w-fit justify-evenly">
              <div className="flex-col grow lg:px-7 dark:text-dark-gray-900">
                <div className="md:text-2xl text-lg font-semibold text-center">
                  {allProposalsDetails.proposalsSubmitted}
                </div>
                <div className="md:text-base text-sm text-center">Total</div>
              </div>
              <div className="flex-col grow border-r border-l lg:px-7 dark:text-dark-gray-900">
                <div className="md:text-2xl text-lg font-semibold text-center">
                  {allProposalsDetails.openProposals}
                </div>
                <div className="md:text-base text-sm text-center">Open</div>
              </div>
              <div className="flex-col grow lg:border-r lg:px-7 dark:text-dark-gray-900">
                <div className="md:text-2xl text-lg font-semibold text-center">
                  {allProposalsDetails.closedProposals}
                </div>
                <div className="md:text-base text-sm text-center">Closed</div>
              </div>
              <div className="pl-7 pr-1 lg:block hidden">
                <button
                  type="button"
                  className="py-3 px-6 bg-primary-50 hover:bg-primary-100 rounded"
                >
                  <Link href={{ pathname: "on-chain-governance/create" }}>
                    <span className="text-sm font-medium text-primary-500">
                      CREATE PROPOSAL
                    </span>
                  </Link>
                </button>
              </div>
            </div>

            {/* Tablet and Mobile Create Proposal Button */}
            <div className="lg:hidden flex w-full md:justify-end mt-4">
              <button
                type="button"
                className="py-3 px-6 bg-primary-50 hover:bg-primary-100 rounded md:w-fit w-full"
              >
                <Link href={{ pathname: "on-chain-governance/create" }}>
                  <span className="text-sm font-medium text-primary-500">
                    CREATE PROPOSAL
                  </span>
                </Link>
              </button>
            </div>
          </div>
        </div>

        <UserQueryButtonRow
          isOpenProposalsClicked={isOpenProposalsClicked}
          userQueryProposalType={userQueryProposalType}
        />

        <div className="hidden md:block mt-8">
          <ProposalTable
            data-testid="OnChainGovernance.ProposalListTable"
            proposals={proposals.queryProposals}
            currentBlockHeight={allProposalsDetails.currentBlockCount}
            currentBlockMedianTime={allProposalsDetails.currentBlockMedianTime}
            isOpenProposalsClicked={isOpenProposalsClicked}
            masternodeId={masternodeId}
          />
        </div>
        <div className="md:hidden block mt-4">
          <ProposalCards
            data-testid="OnChainGovernance.ProposalListCard"
            currentBlockHeight={allProposalsDetails.currentBlockCount}
            currentBlockMedianTime={allProposalsDetails.currentBlockMedianTime}
            isOpenProposalsClicked={isOpenProposalsClicked}
            proposals={proposals.queryProposals}
          />
        </div>
        {/* <div className="flex justify-end mt-8">
          <CursorPagination pages={proposals.pages} path="/on-chain-governance" />
        </div> */}
      </Container>
    </div>
  );
}

function UserQueryButtonRow({
  isOpenProposalsClicked,
  userQueryProposalType,
}: {
  isOpenProposalsClicked: boolean;
  userQueryProposalType: ListProposalsType;
}) {
  const windowSize = useWindowDimensions().width;
  return (
    <div className="mt-[30px] flex flex-row">
      <div className="flex flex-row w-fit grow">
        <Link
          href={{
            pathname: "on-chain-governance/",
            query: {
              proposalStatus: isOpenProposalsClicked ? "open" : "close",
              proposalType: ListProposalsType.ALL,
            },
          }}
        >
          <a
            data-testid="OnChainGovernance.AllProposalsButton"
            className={classNames(
              "md:font-normal font-medium rounded-l border border-r-0 py-[6px] md:px-[25px] px-3 md:text-base text-xs text-gray-900 border-gray-200",
              {
                "border-0 bg-primary-500 text-white":
                  userQueryProposalType === ListProposalsType.ALL,
              }
            )}
          >
            All
          </a>
        </Link>

        <Link
          href={{
            pathname: "on-chain-governance/",
            query: {
              proposalStatus: isOpenProposalsClicked ? "open" : "close",
              proposalType: ListProposalsType.CFP,
            },
          }}
        >
          <a
            data-testid="OnChainGovernance.CfpProposalsButton"
            className={classNames(
              "md:font-normal font-medium border py-[6px] md:px-[25px] px-3 md:text-base text-xs text-gray-900 dark:text-gray-100",
              {
                "border-0 bg-primary-500 text-white":
                  userQueryProposalType === ListProposalsType.CFP,
              }
            )}
          >
            CFP
          </a>
        </Link>

        <Link
          href={{
            pathname: "on-chain-governance/",
            query: {
              proposalStatus: isOpenProposalsClicked ? "open" : "close",
              proposalType: ListProposalsType.VOC,
            },
          }}
        >
          <a
            data-testid="OnChainGovernance.DfipProposalsButton"
            className={classNames(
              "md:font-normal font-medium border border-l-0 rounded-r py-[6px] md:px-[25px] px-3 md:text-base text-xs text-gray-900 dark:text-gray-100",
              {
                "border-0 bg-primary-500 text-white":
                  userQueryProposalType === ListProposalsType.VOC,
              }
            )}
          >
            DFIP
          </a>
        </Link>
      </div>

      <div className="flex flex-row w-fit">
        <Link
          href={{
            pathname: "on-chain-governance/",
            query: {
              proposalType: userQueryProposalType,
              proposalStatus: "open",
            },
          }}
        >
          <a
            data-testid="OnChainGovernance.OpenProposalsButton"
            className={classNames(
              "md:font-normal font-medium rounded-l border border-r-0 py-[6px] md:px-[25px] px-3 md:text-base text-xs text-gray-900 border-gray-200 dark:text-gray-100",
              { "border-0 bg-primary-500 text-white": isOpenProposalsClicked }
            )}
          >
            <div>{windowSize <= 640 ? "Open" : "Open proposals"}</div>
          </a>
        </Link>

        <Link
          href={{
            pathname: "on-chain-governance/",
            query: {
              proposalType: userQueryProposalType,
              proposalStatus: "close",
            },
          }}
        >
          <a
            data-testid="OnChainGovernance.ClosedProposalsButton"
            className={classNames(
              "md:font-normal font-medium border border-l-0 rounded-r py-[6px] md:px-[25px] px-3 md:text-base text-xs text-gray-900 dark:text-gray-100",
              {
                "border-0 bg-primary-500 text-white": !isOpenProposalsClicked,
              }
            )}
          >
            <div>{windowSize <= 640 ? "Closed" : "Closed proposals"}</div>
          </a>
        </Link>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const rpc = getWhaleRpcClient(context);

  let userQueryProposalType = ListProposalsType.ALL;
  let userQueryProposalStatus = UserQueryProposalStatus.Open;
  switch (context.query.proposalStatus) {
    case UserQueryProposalStatus.Close:
      userQueryProposalStatus = UserQueryProposalStatus.Close;
      break;
    case UserQueryProposalStatus.Open:
    default:
      userQueryProposalStatus = UserQueryProposalStatus.Open;
  }

  switch (context.query.proposalType) {
    case ListProposalsType.CFP:
      userQueryProposalType = ListProposalsType.CFP;
      break;
    case ListProposalsType.VOC:
      userQueryProposalType = ListProposalsType.VOC;
      break;
    case ListProposalsType.ALL:
    default:
      userQueryProposalType = ListProposalsType.ALL;
  }

  const currentBlockCount = await rpc.blockchain.getBlockCount();
  const currentBlockInfo = await rpc.blockchain.getBlockStats(
    currentBlockCount
  );
  const currentBlockMedianTime = currentBlockInfo.mediantime;
  const allProposals = await rpc.governance.listGovProposals({
    type: ListProposalsType.ALL,
    status: ListProposalsStatus.ALL,
  });

  const queryProposals = await rpc.governance
    .listGovProposals({
      type: userQueryProposalType,
      status: ListProposalsStatus.ALL,
    })
    .then((proposals) => {
      proposals = proposals.filter((proposal) => {
        if (userQueryProposalStatus === "open") {
          return proposal.status === ProposalStatus.VOTING;
        } else {
          return proposal.status !== ProposalStatus.VOTING;
        }
      });
      return proposals;
    })
    .catch((error) => {
      console.error(error);
      return [];
    });

  return {
    props: getOCGData(
      JSON.parse(JSON.stringify(allProposals)),
      JSON.parse(JSON.stringify(queryProposals)),
      currentBlockCount,
      currentBlockMedianTime,
      userQueryProposalType,
      userQueryProposalStatus
    ),
  };
}

function getOCGData(
  allProposals: ProposalInfo[],
  queryProposals: ProposalInfo[],
  currentBlockCount: number,
  currentBlockMedianTime: number,
  userQueryProposalType: ListProposalsType,
  userQueryProposalStatus: UserQueryProposalStatus
): OCGProps {
  return {
    allProposalsDetails: {
      proposalsSubmitted: allProposals.length,
      openProposals: allProposals.filter(
        (item) => item.status === ProposalStatus.VOTING
      ).length,
      closedProposals: allProposals.filter(
        (item) => item.status !== ProposalStatus.VOTING
      ).length,
      currentBlockCount: currentBlockCount,
      currentBlockMedianTime: currentBlockMedianTime,
      userQueryProposalType: userQueryProposalType,
      userQueryProposalStatus: userQueryProposalStatus,
    },
    proposals: {
      allProposals,
      queryProposals,
      pages: [
        {
          n: 1,
          active: true,
          cursors: [],
        },
        {
          n: 2,
          active: false,
          cursors: ["1"],
        },
        {
          n: 3,
          active: false,
          cursors: ["1", "2"],
        },
      ],
    },
  };
}
