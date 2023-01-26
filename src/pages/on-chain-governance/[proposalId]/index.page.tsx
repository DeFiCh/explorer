import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Container } from "@components/commons/Container";
import { getWhaleApiClient, getWhaleRpcClient } from "@contexts/WhaleContext";
import { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import {
  VoteDecision,
  MasternodeType,
} from "@defichain/jellyfish-api-core/dist/category/governance";
import {
  GovernanceProposalType,
  ProposalVotesResult,
} from "@defichain/whale-api-client/dist/api/governance";
import { ApiPagedResponse } from "@defichain/whale-api-client";
import * as LosslessJSON from "lossless-json";
import { Head } from "@components/commons/Head";
import { Breadcrumb } from "@components/commons/Breadcrumb";
import { getEnvironment } from "@contexts/Environment";
import classNames from "classnames";
import BigNumber from "bignumber.js";
import { EmptySection } from "@components/commons/sections/EmptySection";
import { EnvironmentNetwork } from "@waveshq/walletkit-core";
import {
  CursorPage,
  CursorPagination,
} from "@components/commons/CursorPagination";
import { getVoteCount } from "../shared/getVoteCount";
import { VoteCards, VotesTable } from "../_components/VotesTable";
import { VotingResult } from "../_components/VotingResult";
import { ProposalDetail } from "../_components/ProposalDetail";
import { ConfirmVoteDialog } from "../_components/ConfirmVoteDialog";
import { getCycleEndDate } from "../shared/getCycleEndTime";
import { getSecondsPerBlock } from "../shared/getSecondsPerBlock";
import { formatUnixTime } from "../shared/dateHelper";
import { VoteStages } from "../enum/VoteStages";
import { TotalVotesCards } from "../_components/TotalVotesCards";
import { CfpVotingResultCycleTab } from "../enum/CfpVotingResultCycleTab";

export default function ProposalDetailPage({
  proposal,
  proposalVotes,
  proposalCreationDate,
  proposalEndDate,
  totalVotes,
  pages,
  yes,
  no,
  neutral,
}: InferGetServerSidePropsType<typeof getServerSideProps>): JSX.Element {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChangeVoteClicked, setIsChangeVoteClicked] = useState(false);
  const [userConfirmedSelectedVote, setUserConfirmedSelectedVote] =
    useState<VoteDecision>();
  const [voteCommand, setVoteCommand] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [voteStage, setVoteStage] = useState<VoteStages>(
    VoteStages.VoteProposal
  );

  const [cfpVotingResultTabChoice, setCfpVotingResultTabChoice] = useState(
    CfpVotingResultCycleTab.Current
  );

  useEffect(() => {
    if (isChangeVoteClicked) {
      setIsChangeVoteClicked(false);
      setVoteStage(VoteStages.VoteProposal);
    }
  }, [isChangeVoteClicked]);

  return (
    <>
      <Head title="Proposal Details" />
      <Container className="mt-[40px] md:mt-[44px]">
        <Breadcrumb
          items={[
            {
              path: "/on-chain-governance",
              name: "Proposal",
            },
            {
              path: `/on-chain-governance/${proposal.proposalId}`,
              name: "Proposal Details",
              canonical: true,
              isCurrentPath: true,
            },
          ]}
        />
        <div className="flex flex-col lg:mt-6 md:mt-4 mt-2 lg:flex-row space-y-6 lg:space-y-0 space-x-0 lg:space-x-6">
          <div className="w-full lg:w-8/12">
            <ProposalDetail
              proposal={proposal}
              proposalCreationDate={proposalCreationDate}
              proposalEndDate={proposalEndDate}
            />
            {proposal.type ===
              GovernanceProposalType.COMMUNITY_FUND_PROPOSAL && (
              <div className="hidden lg:block mt-6">
                <CfpVotingResultButtonRow
                  cfpVotingResultTabChoice={cfpVotingResultTabChoice}
                  setCfpVotingResultTabChoice={setCfpVotingResultTabChoice}
                  currenCycle={proposal.currentCycle}
                />
              </div>
            )}

            {cfpVotingResultTabChoice === CfpVotingResultCycleTab.Current ||
            proposal.type === GovernanceProposalType.VOTE_OF_CONFIDENCE ? (
              <div
                className={classNames(
                  "hidden lg:block",
                  proposal.type ===
                    GovernanceProposalType.COMMUNITY_FUND_PROPOSAL
                    ? "mt-4"
                    : "mt-6"
                )}
              >
                <VotesList
                  proposalVotes={proposalVotes}
                  pages={pages}
                  proposalId={proposal.proposalId}
                />
              </div>
            ) : (
              <div className="hidden lg:block mt-4">
                <TotalVotesCards totalVotes={totalVotes} proposal={proposal} />
              </div>
            )}
          </div>
          <div className="w-full lg:w-4/12">
            <VotingResult
              userSelectedVote={userConfirmedSelectedVote}
              voteCommand={voteCommand}
              isLoading={isLoading}
              setIsChangeVoteClicked={setIsChangeVoteClicked}
              yes={yes}
              no={no}
              neutral={neutral}
              status={proposal.status}
              onSubmitVote={() => {
                setIsDialogOpen(true);
              }}
            />
          </div>

          <div className="space-y-0">
            <div
              className={classNames("flex flex-row mb-2 md:mb-4 items-center", {
                "md:mb-0":
                  proposal.type === GovernanceProposalType.VOTE_OF_CONFIDENCE,
              })}
            >
              <div className="grow md:hidden ml-4 ">
                <span className="text-gray-900 dark:text-gray-100 font-semibold">
                  Votes
                </span>
              </div>

              {proposal.type ===
                GovernanceProposalType.COMMUNITY_FUND_PROPOSAL && (
                <div className="block lg:hidden">
                  <CfpVotingResultButtonRow
                    cfpVotingResultTabChoice={cfpVotingResultTabChoice}
                    setCfpVotingResultTabChoice={setCfpVotingResultTabChoice}
                    currenCycle={proposal.currentCycle}
                  />
                </div>
              )}
            </div>
            {cfpVotingResultTabChoice === CfpVotingResultCycleTab.Current ||
            proposal.type === GovernanceProposalType.VOTE_OF_CONFIDENCE ? (
              <div className="lg:hidden w-full">
                <VotesList
                  proposalVotes={proposalVotes}
                  pages={pages}
                  proposalId={proposal.proposalId}
                />
              </div>
            ) : (
              <div className="lg:hidden items-center">
                <TotalVotesCards totalVotes={totalVotes} proposal={proposal} />
              </div>
            )}
          </div>
        </div>
      </Container>
      <ConfirmVoteDialog
        voteStage={voteStage}
        setVoteStage={setVoteStage}
        setUserConfirmedSelectedVote={setUserConfirmedSelectedVote}
        userConfirmedSelectedVote={userConfirmedSelectedVote}
        setVoteCommand={setVoteCommand}
        voteCommand={voteCommand}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        proposalId={proposal.proposalId}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}

function VotesList({
  proposalVotes,
  pages,
  proposalId,
}: {
  proposalVotes: ApiPagedResponse<ProposalVotesResult>;
  pages: CursorPage[];
  proposalId: string;
}): JSX.Element {
  return (
    <>
      {proposalVotes.length === 0 ? (
        <EmptySection message="No votes posted yet" className="mt-0" />
      ) : (
        <>
          <div className="md:hidden">
            <VoteCards votes={proposalVotes} />
          </div>
          <div className="hidden md:block">
            <VotesTable votes={proposalVotes} />
          </div>
        </>
      )}

      <div className="flex justify-end mt-8">
        <CursorPagination
          pages={pages}
          path={`/on-chain-governance/${proposalId}`}
        />
      </div>
    </>
  );
}

function CfpVotingResultButtonRow({
  setCfpVotingResultTabChoice,
  cfpVotingResultTabChoice,
  currenCycle,
}: {
  setCfpVotingResultTabChoice: Dispatch<
    SetStateAction<CfpVotingResultCycleTab>
  >;
  cfpVotingResultTabChoice: CfpVotingResultCycleTab;
  currenCycle: number;
}) {
  return (
    <div className="flex flex-row">
      <button
        type="button"
        data-testid="OnChainGovernance.VotingFlow.NoVote"
        className={classNames(
          "md:px-5 rounded-l border px-3 py-[6px] md:text-sm text-xs font-medium text-gray-500",
          cfpVotingResultTabChoice === CfpVotingResultCycleTab.Current
            ? "border-transparent bg-primary-500 dark:bg-dark-primary-500 text-white dark:text-dark-gray-0"
            : "dark:border-dark-gray-300 dark:text-dark-gray-900 dark:bg-dark-gray-200 border-gray-300"
        )}
        onClick={() => {
          setCfpVotingResultTabChoice(CfpVotingResultCycleTab.Current);
        }}
      >
        <span className="hidden md:block">Current cycle</span>
        <span className="md:hidden">Current</span>
      </button>
      <button
        type="button"
        data-testid="OnChainGovernance.VotingFlow.YesVote"
        disabled={currenCycle === 1}
        className={classNames(
          "md:px-5 border border-l-0 rounded-r px-3 py-[6px] md:text-sm text-xs font-medium text-gray-500 tracking-[0.0025em] disabled:text-gray-500 disabled:border-gray-200 disabled:opacity-30",
          cfpVotingResultTabChoice === CfpVotingResultCycleTab.Previous
            ? "border-transparent bg-primary-500 dark:bg-dark-primary-500 text-white dark:text-dark-gray-0"
            : "dark:border-dark-gray-300 dark:text-dark-gray-900 dark:bg-dark-gray-200 border-gray-300"
        )}
        onClick={() => {
          setCfpVotingResultTabChoice(CfpVotingResultCycleTab.Previous);
        }}
      >
        <span className="hidden md:block">Previous cycle</span>
        <span className="md:hidden">Previous</span>
      </button>
    </div>
  );
}

function getAllCycleVotes(
  allCycleProposalVotes: ApiPagedResponse<ProposalVotesResult>
): {} {
  const totalVotes = {};
  for (let i = 0; i < allCycleProposalVotes.length; i += 1) {
    const vote = allCycleProposalVotes[i];
    const voteCycle = vote.cycle;
    if (voteCycle in totalVotes) {
      totalVotes[voteCycle] += 1;
    } else {
      totalVotes[voteCycle] = 1;
    }
  }
  return totalVotes;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const proposalId = context.params?.proposalId?.toString().trim() as string;
  const api = getWhaleApiClient(context);
  const rpc = getWhaleRpcClient(context);
  const next = CursorPagination.getNext(context);

  try {
    const proposal = await api.governance.getGovProposal(proposalId);
    if (proposal.amount) {
      proposal.amount = LosslessJSON.parse(
        LosslessJSON.stringify(proposal.amount)
      );
    }
    const proposalVotes = await api.governance.listGovProposalVotes({
      id: proposalId,
      masternode: MasternodeType.ALL,
      cycle: proposal.currentCycle,
      size: 10,
      next: next,
    });
    const pages = CursorPagination.getPages(
      context,
      proposalVotes as ApiPagedResponse<any>
    );

    const currentBlockHeight = await rpc.blockchain.getBlockCount();
    const currentBlockMedianTime = await api.blocks
      .get(currentBlockHeight.toString())
      .then((block) => block.medianTime);
    const proposalCreationDate = await api.blocks
      .get(proposal.creationHeight.toString())
      .then((block) => formatUnixTime(block.medianTime));

    const network =
      (context.query.network?.toString() as EnvironmentNetwork) ??
      getEnvironment().networks[0];
    const secondsPerBlock = getSecondsPerBlock(network);

    let proposalEndDate: string;
    if (
      new BigNumber(currentBlockHeight).isGreaterThan(proposal.cycleEndHeight)
    ) {
      proposalEndDate = await api.blocks
        .get(proposal.cycleEndHeight.toString())
        .then((block) => formatUnixTime(block.medianTime));
    } else {
      proposalEndDate = getCycleEndDate(
        proposal.cycleEndHeight,
        currentBlockHeight,
        currentBlockMedianTime,
        secondsPerBlock
      );
    }
    // All votes to get statistics breakdown
    const allCycleProposalVotes = await api.governance.listGovProposalVotes({
      id: proposalId,
      masternode: MasternodeType.ALL,
      cycle: -1,
      all: true,
    });

    const totalVotes = getAllCycleVotes(allCycleProposalVotes);
    // calculate stats (yes/no/neutral) for current cycle
    const stats = getVoteCount(
      allCycleProposalVotes.filter(
        (each) => each.cycle === proposal.currentCycle
      )
    );
    return {
      props: {
        proposal,
        proposalVotes,
        proposalCreationDate,
        proposalEndDate,
        totalVotes,
        pages,
        ...stats,
      },
    };
  } catch {
    return { notFound: true };
  }
}
