// import Image from "next/image";

// export default function Home() {
//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between p-24"></main>
//   );
// }

"use client";
import "./blocks/odo.css";
import React, { useEffect, useState } from "react";
import ExplorerNav from "@/components/ExplorerNav";
import timeAgo from "@/lib/ConvertTime";

import {
  Chart,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LinearScale,
  CategoryScale,
  PointElement,
  ScriptableContext,
  TooltipModel,
  TooltipItem,
} from "chart.js";
import { Line } from "react-chartjs-2";
Chart.register(
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LinearScale,
  CategoryScale,
  PointElement
);
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  User,
} from "@nextui-org/react";
import {
  ArrowRightLeft,
  Blocks,
  CheckCircle,
  History,
  Users,
} from "lucide-react";

import "./styles.css";

import Link from "next/link";

import ConvertBigNumber from "@/lib/ConvertBigNumber";
import truncateMiddle from "@/lib/TruncateMiddle";
import { useExtrinsic } from "@/context/ExtrinsicsContext";
import {
  get_transactions,
  get_latest_blocks,
  get_latest_transactions,
} from "@/graphql/queries";
import { day } from "@/lib/millis";
import { HashLoader } from "react-spinners";
import { Block, Transfer } from "@/graphql/types";
import dynamic from "next/dynamic";
import { light, useThemeState } from "./theme";
const Odometer = dynamic(() => import("react-odometerjs"), {
  ssr: false,
  loading: () => <div>0</div>,
});

function frequency(d: Date[]): number[] {
  let map = Array<number>(30).fill(0);
  d.forEach(
    (date) =>
      (map[
        29 - Math.round(Math.abs((date.getTime() - new Date().getTime()) / day))
      ] += 1)
  );
  return map;
}

const Explorer = () => {
  const [totalBlock, setTotalBlock] = useState<number>(0);
  const [totalTokenTransfer, setTotalTokenTransfer] = useState<number>(0);
  const { extrinsic, setExtrinsic } = useExtrinsic();
  // console.log("extrinsic", extrinsic);

  const data1 = [
    {
      id: 1,
      title: "Finalized Blocks",
      value: totalBlock,
      icon: <Blocks size={30} color="#00A4E5" />,
    },
    // {
    //   id: 2,
    //   title: "Transactions",
    //   value: "-",
    //   icon: <ArrowRightLeft color="#00A4E5" size={30} />,
    // },
    // {
    //   id: 3,
    //   title: "Holders",
    //   value: "-",
    //   icon: <Users color="#00A4E5" size={30} />,
    // },
    {
      id: 4,
      title: "Signed Extrinsics",
      value: extrinsic,
      icon: <History color="#00A4E5" size={30} />,
    },
  ];

  return (
    <>
      <ExplorerNav
        bgColor="bg-background"
        textColor="gray"
        logo={
          light(useThemeState()[0])
            ? "/sel-logo-text.png"
            : "/sel-logo-text-white.png"
        }
        search={true}
        selIcon="/sel-logo-blue.png"
      />
      <div className="px-4 sm:px-20 lg:px-40 mt-6">
        <section className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-2">
          {data1.map((data) => {
            return (
              <Card className="w-full" key={data.id}>
                <CardBody className="flex gap-2 md:gap-4 flex-row  p-3 md:p-6">
                  {data.icon}
                  <div className="flex flex-col mt-6">
                    <p className="text-sm text-default-500">{data.title}</p>
                    <p className="text-xl md:text-2xl ">
                      <Odometer value={data.value} />
                    </p>
                  </div>
                </CardBody>
              </Card>
            );
          })}
          <Card className="w-full hidden md:block" key={3}>
            <div className="flex items-center relative w-full flex-auto place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased md:gap-4 flex-row">
              <ArrowRightLeft
                style={{
                  position: "absolute",
                  marginLeft: "1.5rem",
                  top: "1.5rem",
                  marginBottom: "0.75rem",
                }}
                color="#00A4E5"
                size={30}
              />
              <LastMonthsTransfers />
            </div>
          </Card>
        </section>
        <section className="mt-3">
          <Card className="w-full md:hidden" key={3}>
            <div className="flex items-center relative w-full flex-auto place-content-inherit align-items-inherit h-auto break-words text-left overflow-y-auto subpixel-antialiased md:gap-4 flex-row">
              <ArrowRightLeft
                style={{
                  position: "absolute",
                  marginLeft: "1.5rem",
                  top: "1.5rem",
                }}
                color="#00A4E5"
                size={30}
              />

              <LastMonthsTransfers />
            </div>
          </Card>
        </section>
        <section className="mt-6 flex flex-col md:flex-row gap-4">
          <LatestBlocks setTotalBlock={setTotalBlock} />
          <LatestTransactions setTotalTokenTransfer={setTotalTokenTransfer} />
        </section>
      </div>
    </>
  );
};

class Lazy<T> {
  data?: T;
  assume(): T {
    return this.data!;
  }
  /** takes a thunk */
  get(thunk: () => T): T {
    if (this.data) {
      return this.data!;
    } else {
      this.data = thunk();
      return this.data;
    }
  }
}

var when = (() => {
  var now = new Date();
  now.setUTCDate(now.getUTCDate() - 30);
  return now;
})();

var labels = Array.from(Array(30).keys());

var lastMonth = new Lazy<number[]>();
const LastMonthsTransfers: React.FC = () => {
  const result = get_transactions(when);
  let last: number[];
  switch (result.state) {
    case "loading":
      return (
        <HashLoader
          size={50}
          style={{ alignContent: "center" }}
          color={"#00A3E4"}
        />
      );
    case "error":
      return <p>{result.message}</p>;
    case "ok":
      last = lastMonth.get(() => frequency(result.data));
  }

  return (
    <div className="flex flex-col w-full noscroll">
      {(() => {
        return (
          <div style={{ width: "101%", maxHeight: "95%" }}>
            <Line
              data={{
                labels,
                datasets: [{ data: last }],
              }}
              options={{
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: "#ffffff80",
                    titleColor: "#000000",
                    bodyColor: "#000000",
                    bodyFont: { family: "monospace" },
                    titleFont: { family: "monospace" },
                    displayColors: false,
                    callbacks: {
                      title: (data) => {
                        return data[0].parsed.y + " tx's";
                      },
                      label: (context) => {
                        return "";
                      },
                    },
                  },
                },
                interaction: {
                  mode: "nearest",
                  axis: "x",
                  intersect: false,
                },
                elements: {
                  line: {
                    tension: 0.2,
                    borderWidth: 2,
                    borderColor: "#acdb90",
                    fill: "start",
                    backgroundColor: (context: ScriptableContext<"line">) => {
                      const ctx = context.chart.ctx;
                      const gradient = ctx.createLinearGradient(
                        0,
                        0,
                        0,
                        ctx.canvas.height
                      );
                      gradient.addColorStop(0, "#acdb904c");
                      gradient.addColorStop(0.4, "#acdb9000");
                      return gradient;
                    },
                  },
                  point: { radius: 0, hitRadius: 0 },
                },

                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      stepSize: 1,
                      autoSkip: false,

                      callback: (x) =>
                        x == 2 || x == 15 || x == 27
                          ? new Date(
                              when.getTime() +
                                day * { 2: 0, 15: 15, 27: 30 }[x]!
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : undefined,
                    },
                  },
                  y: {
                    display: false,
                  },
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
            ></Line>
          </div>
        );
      })()}
    </div>
  );
};

export default Explorer;
interface LatestBlocksProps {
  setTotalBlock: (newTotalBlock: number) => void;
}

const LatestBlocks: React.FC<LatestBlocksProps> = ({ setTotalBlock }) => {
  const { result, refresh } = get_latest_blocks(10);
  const [theme] = useThemeState();
  useEffect(() => {
    const intervalId = setInterval(() => {
      refresh();
    }, 1000);

    return () => clearInterval(intervalId);
  }, [refresh]);
  let data: Block[];
  switch (result.state) {
    case "loading":
      return (
        <Card className="w-full">
          <CardHeader className="border-b">Latest Blocks</CardHeader>
          <CardBody>
            <HashLoader
              size={150}
              style={{ alignContent: "center" }}
              color={"#00A3E4"}
            />
          </CardBody>
        </Card>
      );
    case "error":
      return <p>Error: {result.message}</p>;
    case "ok":
      data = result.data;
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b">Latest Blocks</CardHeader>
      <CardBody>
        <Table
          aria-label="Example empty table"
          removeWrapper
          hideHeader
          bottomContent={
            <div className="flex items-center justify-center ">
              <Link href="/blocks">View All Blocks</Link>
            </div>
          }
          className="pt-0"
          classNames={{ wrapper: "pt-0" }}
        >
          <TableHeader>
            <TableColumn>Blocks</TableColumn>
            <TableColumn>Time</TableColumn>
          </TableHeader>
          <TableBody>
            {data.map((x) => {
              setTotalBlock(x.height);
              return (
                <TableRow key={x.id} className=" border-b">
                  <TableCell>
                    <Link
                      href={`/blocks/${x.id}`}
                      className="text-primary font-semibold"
                    >
                      <User
                        avatarProps={{
                          radius: "md",
                          src: light(theme) ? "/block.png" : "/block-dark.png",
                        }}
                        description={
                          <p className=" font-light">
                            Include
                            <span className="text-primary ml-2">
                              {x.extrinsicsCount} Extrinsics {x.eventsCount}{" "}
                              Events
                            </span>
                          </p>
                        }
                        name={x.height}
                      />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="relative flex items-center justify-end gap-2 font-light">
                      <p>{timeAgo(x.timestamp)}</p>

                      <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                        <CheckCircle color="green" size="16px" />
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};

interface LatestTokenTransferProps {
  setTotalTokenTransfer: (newTotalBlock: number) => void;
}

const LatestTransactions: React.FC<LatestTokenTransferProps> = ({
  setTotalTokenTransfer,
}) => {
  const [theme] = useThemeState();
  const result = get_latest_transactions(10);
  let data: Transfer[];
  switch (result.state) {
    case "loading":
      return (
        <Card className="w-full">
          <CardHeader className="border-b">Latest Transactions</CardHeader>
          <CardBody>
            <HashLoader
              size={150}
              style={{ alignContent: "center" }}
              color={"#00A3E4"}
            />
          </CardBody>
        </Card>
      );
    case "error":
      return <p>Error: {result.message}</p>;
    case "ok":
      data = result.data;
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b">Latest Transactions</CardHeader>
      <CardBody>
        <Table
          aria-label="Example empty table"
          removeWrapper
          hideHeader
          bottomContent={
            <div className="flex items-center justify-center ">
              <Link href="/tx">View All Transactions</Link>
            </div>
          }
          className="pt-0"
          classNames={{ wrapper: "pt-0" }}
        >
          <TableHeader>
            <TableColumn>Blocks</TableColumn>
            <TableColumn>Time</TableColumn>
          </TableHeader>
          <TableBody>
            {data.map((x, index: number) => {
              // console.log("tokenTransfers", typeof x.from);
              setTotalTokenTransfer(index);
              return (
                <TableRow key={x.id} className=" border-b">
                  <TableCell>
                    <Link
                      href={`/tx/${x.id}`}
                      className="text-sel_blue font-semibold "
                    >
                      <User
                        avatarProps={{
                          radius: "md",
                          src: light(theme)
                            ? "/transaction.png"
                            : "/transaction-dark.png",
                        }}
                        description={
                          <p className="font-light">
                            From
                            <span className="text-sel_blue ml-2">
                              <Link href={`/accounts/${x.from.evmAddress}`}>
                                {truncateMiddle(x.from.evmAddress, 32)}
                              </Link>
                              <br className="md:hidden" />
                              <span className="pr-2 md:px-2 text-gray-400">
                                To
                              </span>
                              <Link
                                href={`/accounts/${x.to.evmAddress}`}
                                className="truncate"
                              >
                                {truncateMiddle(x.to.evmAddress, 32)}
                              </Link>
                            </span>
                          </p>
                        }
                        name={x.blockNumber}
                      />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="relative flex flex-col items-end justify-end font-light">
                      <span className="text-md">
                        {ConvertBigNumber(x.amount) + " "}
                        <Link
                          href={`/evm/contracts/${x.contract}`}
                          className="text-sel_blue"
                        >
                          {x.symbol}
                        </Link>
                      </span>
                      <p>{timeAgo(x.timestamp)}</p>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
};
