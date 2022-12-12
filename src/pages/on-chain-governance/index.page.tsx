import { Container } from "@components/commons/Container";
import BigNumber from "bignumber.js";
import { CursorPagination } from "@components/commons/CursorPagination";
import { NumericFormat } from "react-number-format";
import { newPlaygroundRpcClient } from "@contexts/WhaleContext";
import { GetServerSidePropsContext } from "next";
import { getEnvironment } from "@contexts/Environment";
import { NetworkConnection } from "@contexts/NetworkContext";
import { Button } from "./_components/Button";
import { getDuration } from "./shared/durationHelper";
import { ProgressBar } from "./_components/ProgressBar";
import { votingStages } from "./enum/votingStages";
import { OnChainGovernanceTitles } from "./enum/onChainGovernanceTitles";
import { ProposalTable } from "./_components/ProposalTable";
import { ProposalCards } from "./_components/ProposalCard";

export default function OnChainGovernancePage({
  votingCycle,
  proposals,
  pages,
}) {
  return (
    <Container className="md:pt-11 pt-10 pb-20">
      <div
        data-testid="OnChainGovernance.Title"
        className="md:text-4xl text-2xl tracking-[0.0015em] font-semibold dark:text-dark-gray-900"
      >
        On Chain Governance
      </div>
      <div className="flex flex-row items-center md:mt-12 mt-6">
        <div
          data-testid="OnChainGovernance.VotingCycleTitle"
          className="text-2xl font-medium grow dark:text-dark-gray-900"
        >
          {OnChainGovernanceTitles.votingCycleTitle +
            votingCycle.votingCycleNumber}
        </div>
        <div className="hidden md:block">
          <div className="flex flex-row items-center gap-x-3">
            <Button
              label={`Previous voting cycles`.toUpperCase()}
              testId="OnChainGovernance.PreviousVotingCycleButton"
              onClick={() => {}}
              customStyle="hover:bg-gray-50"
            />
            {votingCycle.currentStage === votingStages.open && (
              <Button
                label={`Submit a proposal`.toUpperCase()}
                testId="OnChainGovernance.SubmitProposalButton"
                onClick={() => {}}
                customStyle="bg-primary-50 hover:bg-primary-100"
              />
            )}
          </div>
        </div>
      </div>
      <div className="flex lg:flex-row flex-col lg:mt-10 md:mt-6 mt-8 lg:mb-[38px] mb-[54px] gap-5 md:gap-y-4">
        <div className="flex md:flex-row flex-col gap-5">
          <div className="flex md:flex-row flex-col md:items-center gap-2">
            <div
              data-testid="OnChainGovernance.ProposalsSubmittedTitle"
              className="text-gray-500 text-lg"
            >
              {OnChainGovernanceTitles.proposalsSubmittedTitle}
            </div>
            <div
              data-testid="OnChainGovernance.ProposalsSubmitted"
              className="font-semibold text-gray-900 text-lg"
            >
              {votingCycle.proposalsSubmitted}
            </div>
          </div>

          <div className="flex flex-row md:gap-x-5 gap-x-9">
            <div className="flex md:flex-row flex-col md:items-center gap-2">
              <div
                data-testid="OnChainGovernance.DfipsTitle"
                className="text-gray-500 text-lg"
              >
                {OnChainGovernanceTitles.dfipsTitle}
              </div>
              <div
                data-testid="OnChainGovernance.Dfips"
                className="font-semibold text-gray-900 text-lg"
              >
                {votingCycle.dfips}
              </div>
            </div>
            <div className="flex md:flex-row flex-col md:items-center gap-2">
              <div
                data-testid="OnChainGovernance.CfpsTitle"
                className="text-gray-500 text-lg"
              >
                {OnChainGovernanceTitles.cfpsTitle}
              </div>
              <div
                data-testid="OnChainGovernance.Cfps"
                className="font-semibold text-gray-900 text-lg"
              >
                {votingCycle.cfps}
              </div>
            </div>
          </div>
          {votingCycle.currentStage === votingStages.vote && (
            <div className="flex md:flex-row flex-col md:items-center gap-2">
              <div
                data-testid="OnChainGovernance.TotalVotesTitle"
                className="text-gray-500 text-lg"
              >
                {OnChainGovernanceTitles.totalVotesTitle}
              </div>
              <div
                data-testid="OnChainGovernance.TotalVotes"
                className="font-semibold text-gray-900 text-lg"
              >
                <NumericFormat
                  displayType="text"
                  thousandSeparator
                  value={votingCycle.totalVotes}
                  decimalScale={0}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex md:flex-row flex-col gap-5">
          <div className="flex md:flex-row flex-col md:items-center gap-2">
            <div
              data-testid="OnChainGovernance.CurrentStageTitle"
              className="text-gray-500 text-lg"
            >
              {OnChainGovernanceTitles.currentStageTitle}
            </div>
            <div
              data-testid="OnChainGovernance.CurrentStage"
              className="font-semibold text-gray-900 text-lg"
            >
              {votingCycle.currentStage}
            </div>
          </div>
          <div className="flex md:flex-row flex-col md:items-center gap-2">
            <div
              data-testid="OnChainGovernance.TimeLeftTitle"
              className="text-gray-500 text-lg"
            >
              {OnChainGovernanceTitles.timeLeftTitle}
            </div>
            <div
              data-testid="OnChainGovernance.TimeLeft"
              className="font-semibold text-gray-900 text-lg"
            >
              {getDuration(votingCycle.timeLeft)}
            </div>
          </div>
        </div>
      </div>

      <ProgressBar
        data-testid="OnChainGovernance.ProgressBar"
        votingProgress={{
          totalTime: new BigNumber(100),
          timeLeft: new BigNumber(100),
        }}
        submissionProgress={{
          totalTime: new BigNumber(votingCycle.totalTime),
          timeLeft: new BigNumber(votingCycle.timeLeft),
        }}
        segment={2}
      />
      <div className="block md:hidden">
        <div className="mt-[46px] items-center">
          <Button
            label={`Previous voting cycles`.toUpperCase()}
            testId="OnChainGovernance.PreviousVotingCycleButton"
            onClick={() => {}}
            customStyle="w-full hover:bg-gray-50 "
          />
          {votingCycle.currentStage === votingStages.open && (
            <Button
              label={`Submit a proposal`.toUpperCase()}
              testId="OnChainGovernance.SubmitProposalButton"
              onClick={() => {}}
              customStyle="mt-4 w-full bg-primary-50 hover:bg-primary-100"
            />
          )}
        </div>
      </div>

      <div className="hidden lg:block mt-[62px]">
        <ProposalTable
          data-testid="OnChainGovernance.CurrentProposalListTable"
          currentStage={votingCycle.currentStage}
          proposals={proposals.items}
        />
      </div>
      <div className="lg:hidden block mt-[62px]">
        <ProposalCards
          data-testid="OnChainGovernance.CurrentProposalListCard"
          currentStage={votingCycle.currentStage}
          proposals={proposals.items}
        />
      </div>
      <div className="flex justify-end mt-8">
        <CursorPagination pages={pages} path="/on-chain-governance" />
      </div>
    </Container>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const network =
    context.query.network?.toString() ?? getEnvironment().networks[0];
  if (NetworkConnection.RemotePlayground === network) {
    const rpc = newPlaygroundRpcClient(context);
    // TODO uncomment to create test data
    // const data = {
    //   title: 'Testing proposal',
    //   amount: '100000000',
    //   context: '<Git issue url>',
    //   payoutAddress: 'bcrt1q4lkkq8snxjrfxm03yukmpw3nnnkwaprmhg9pmz',
    //   cycles: 2
    // }
    // for( let i=0; i < 10; i += 1) {
    //   await rpc.call(
    //     "creategovvoc",[{...data, title: `${data.title} ${i+1}`}, [] ],
    //     'number'
    //   )
    // }
    const items = await rpc.call("listgovproposals", ["all", "all"], {
      amount: "bignumber",
    });
    console.log({ items });
  }
  return {
    props: {
      votingCycle: {
        votingCycleNumber: 3434,
        proposalsSubmitted: 12,
        dfips: 24,
        cfps: 24,
        currentStage: votingStages.open,
        timeLeft: 9000,
        totalTime: 10000,
        totalVotes: 8392,
      },
      proposals: {
        items: [
          {
            proposalName: "Support Europe",
            proposalType: "DFIP",
            proposer: "Chevol Valra",
            links: {
              github: "https://github.com/",
            },
          },
          {
            proposalName: "Support SG",
            proposalType: "DFIP",
            proposer: "Chevol Valra",
            links: {
              github: "https://github.com/",
            },
          },
          {
            proposalName: "Support MY",
            proposalType: "DFIP",
            proposer: "Chevol Valra",
            links: {
              github: "https://github.com/",
            },
          },
          {
            proposalName: "Support IN",
            proposalType: "DFIP",
            proposer: "Chevol Valra",
            links: {
              github: "https://github.com/",
            },
          },
        ],
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
    },
  };
}
