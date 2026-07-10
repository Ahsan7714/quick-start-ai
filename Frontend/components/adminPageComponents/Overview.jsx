import React from "react";
import CountUp from 'react-countup';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Area,
} from "recharts";
import { User, Users } from "lucide-react";
import { Card } from "@nextui-org/react";
import { CardContent, CardTitle } from "../ui/card";

// Sample data for the charts
const totalUsersData = [
  { name: "Jan", value: 500 },
  { name: "Feb", value: 600 },
  { name: "Mar", value: 700 },
  { name: "Apr", value: 900 },
  { name: "May", value: 1100 },
  { name: "Jun", value: 1234 },
];

const activeUsersData = [
  { name: "Jan", value: 300 },
  { name: "Feb", value: 400 },
  { name: "Mar", value: 500 },
  { name: "Apr", value: 700 },
  { name: "May", value: 800 },
  { name: "Jun", value: 1021 },
];



const Overview = () => {
  return (
    <div className="p-6">
    {/* Cards Section */}
    <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-2">
      {[
        { title: "Total Users", icon: Users, value: 1234, change: "+10%" },
        { title: "Active Users", icon: User, value: 1021, change: "+5%" },
      ].map((card, index) => (
        <div key={index} className="bg-gray-800 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">{card.title}</h3>
            {React.createElement(card.icon, { className: "w-4 h-4 text-blue-400" })}
          </div>
          <p className="text-2xl font-bold">
            <CountUp end={card.value} duration={2} separator="," />
          </p>
          <p className="text-xs text-blue-400">
            {card.change} from last month
          </p>
        </div>
      ))}
    </div>

      {/* Total Users Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card className="p-4 bg-background-light dark:bg-background-dark">
          <CardTitle className="mb-6 text-center">Total Users Growth:</CardTitle>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                width={500}
                height={400}
                data={totalUsersData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" scale="band" />
                <YAxis />
                <Bar dataKey="value" barSize={20} fill="#413ea0" />
                <Line type="monotone" dataKey="value" stroke="#ff7300" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Users Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
        <Card className="p-4 bg-background-light dark:bg-background-dark">
          <CardTitle className="mb-6 text-center">Active Users Growth:</CardTitle>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                width={500}
                height={400}
                data={activeUsersData}
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 20,
                  left: 20,
                }}
              >
                <XAxis dataKey="name" scale="band" />
                <YAxis />
                <Bar dataKey="value" barSize={20} fill="#8884D8" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default Overview;
