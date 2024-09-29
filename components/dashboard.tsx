'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip} from 'recharts'
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {  useToast } from "@/components/ui/toast"
import { getUserData, getLeaderboardData, updateTopic } from '../app/dashboard/action'
import { User, Topic, LeaderboardEntry} from '../app/dashboard/types'




const RadialProgress = ({ value, size }: { value: number, size: number }) => {
  const data = [
    { name: 'Progress', value: value },
    { name: 'Remaining', value: 100 - value },
  ]
  const COLORS = ['#10B981', '#111111']

  return (
  
    <ResponsiveContainer width={size} height={size}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={size * 0.6 / 2}
          outerRadius={size / 2}
          fill="#8884d8"
          dataKey="value"
          startAngle={90}
          endAngle={-270}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-white">
          {`${value}%`}
        </text>
      </PieChart>
    </ResponsiveContainer>
  )
}

export function DashboardComponent() {

  const [activeTab, setActiveTab] = useState('progress')
  const [topics, setTopics] = useState<Topic[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  

  useEffect(() => {
    fetchUserData()
    fetchLeaderboardData()
  },[])

  const fetchUserData = async () => {
    try {
      const userData = await getUserData()
      setCurrentUser(userData)
      setTopics(userData.topics)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to fetch user data',
        variant: "destructive",
      })
      router.push('/login')
    }
  }

  const fetchLeaderboardData = async () => {
    try {
      const leaderboardData = await getLeaderboardData()
      setLeaderboard(leaderboardData)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to fetch leaderboard data',
        variant: "destructive",
      })
    }
  }

  const handleTopicUpdate = async (index: number, field: keyof Omit<Topic, 'id' | 'userId'>, value: number) => {
    const newTopics: Topic[] = topics.map((topic, i) => 
      i === index ? { ...topic, [field]: value } : topic
    );
    setTopics(newTopics);
 
    try {
      const updatedTopic = await updateTopic(newTopics[index].name, field, value)
      newTopics[index] = updatedTopic
      setTopics(newTopics)
      toast({
        title: "Success",
        description: "Topic updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update topic',
        variant: "destructive",
      })
    }
  }

  const overallProgress = Math.round(topics.reduce((sum, topic) => sum + topic.progress, 0) / topics.length)

 // Filter out the current user from the leaderboard
const filteredLeaderboard = leaderboard.filter(user => user.name !== currentUser?.username);

// Add current user to leaderboard as "You"
const leaderboardWithCurrentUser = [
  ...filteredLeaderboard,
  { name: 'You', progress: overallProgress, avatar: '/image.png', topics: topics },
].sort((a, b) => b.progress - a.progress);



interface CustomXAxisTickProps {
  x: number;           // The x-coordinate of the tick
  y: number;           // The y-coordinate of the tick
  payload: {          // Information about the tick
    value: string;    // The value of the tick (topic name)
  };
}


// Custom XAxisTick component to handle rotation
const CustomXAxisTick = ({ x, y, payload }:CustomXAxisTickProps) => {
  return (
    <g transform={`translate(${x},${y})`} >
      <text
        x={0}
        y={0}
        dy={16} // adjust as necessary
        textAnchor="end"
        fill="#fff"
        transform="rotate(-45)"
        fontSize="12px"
      >
        {payload.value}
      </text>
    </g>
  );
};


  return (
    
    <div className="container mx-auto p-4 bg-stone-950 text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-green-300">DSA Progress Tracker</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 bg-green-900">
          <TabsTrigger value="progress" className="data-[state=active]:bg-green-700">My Progress</TabsTrigger>
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-green-700">Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="progress">
          <Card className="mb-6 bg-black border-yellow-900">
            <CardHeader>
              <CardTitle className="text-green-500">Overall Progress</CardTitle>
              <CardDescription className="text-gray-400">Your total DSA learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <RadialProgress value={overallProgress} size={200} />
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            {topics.map((topic, index) => (
              <Card key={topic.name} className="bg-black border-gray-900">
                <CardHeader>
                  <CardTitle className="text-green-500">{topic.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={topic.progress} className="w-full bg-gray-700"  />
                  <p className="mt-2 text-sm text-gray-400">{topic.progress}% Complete</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mt-2 bg-green-700 hover:bg-yellow-600">Update Progress</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black border-yellow-900">
                      <DialogHeader>
                        <DialogTitle className="text-green-500">Update {topic.name} Progress</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400">Learning %</label>
                          <Slider
                            value={[topic.learning]}
                            max={50}
                            step={1}
                            onValueChange={(value) => handleTopicUpdate(index, 'learning', value[0])}
                            className="bg-gray-700"
                          />
                          <span className="text-sm text-gray-400">{topic.learning}</span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400">LeetCode Easy (min 15)</label>
                          <Slider
                            value={[topic.leetcodeEasy]}
                            max={15}
                            step={1}
                            onValueChange={(value) => handleTopicUpdate(index, 'leetcodeEasy', value[0])}
                            className="bg-gray-700"
                          />
                          <span className="text-sm text-gray-400">{topic.leetcodeEasy}</span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400">LeetCode Medium (min 20)</label>
                          <Slider
                            value={[topic.leetcodeMedium]}
                            max={20}
                            step={1}
                            onValueChange={(value) => handleTopicUpdate(index, 'leetcodeMedium', value[0])}
                            className="bg-gray-700"
                          />
                          <span className="text-sm text-gray-400">{topic.leetcodeMedium}</span>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400">LeetCode Hard (min 15)</label>
                          <Slider
                            value={[topic.leetcodeHard]}
                            max={15}
                            step={1}
                            onValueChange={(value) => handleTopicUpdate(index, 'leetcodeHard', value[0])}
                            className="bg-gray-700"
                          />
                          <span className="text-sm text-gray-400">{topic.leetcodeHard}</span>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-6 bg-black border-yellow-900">
            <CardHeader>
              <CardTitle className="text-green-500">Topic Progress Comparison</CardTitle>
            </CardHeader>
            <CardContent className="h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topics} 
                margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                  <XAxis 
                  dataKey="name" 
                  stroke="#fff"  
                  tick={CustomXAxisTick}
                  height={100} // Increased height to accommodate rotated labels
                  interval={0} // Ensures all labels are displayed
                  />
                  <YAxis stroke="#fff" />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #10B981',color:'white'  }} />
                  <Bar dataKey="progress" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leaderboard">
          <Card className="bg-black border-yellow-900">
            <CardHeader>
              <CardTitle className="text-green-500">Leaderboard</CardTitle>
              <CardDescription className="text-gray-400">See how you rank among your peers</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {leaderboardWithCurrentUser.map((user, index) => (
                  <li key={user.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-gray-200">{index + 1}.</span>
                      <Avatar>
                        {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <Button variant="link" onClick={() => setSelectedUser(user)} className="text-green-500">
                        {user.name === 'You' ? <span className="font-bold">{user.name}</span> : user.name}
                      </Button>
                    </div>
                    <Progress value={user.progress} className="w-1/3 bg-gray-700"  />
                    <span className="text-green-500">{user.progress}%</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          {selectedUser && (
            <Card className="mt-6 bg-black border-yellow-900">
              <CardHeader>
                <CardTitle className="text-green-500">{selectedUser.name}&apos;s Topic Progress</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                  data={selectedUser.topics}
                  margin={{ top: 20, right: 30, left: 20, bottom: 30 }} 
                  >
                    <XAxis dataKey="name" 
                    stroke="#fff"
                    tick={CustomXAxisTick}
                    height={100}
                    interval={0} />

                    <YAxis stroke="#fff" />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #10B981', color:'white' }}  />
                    <Bar dataKey="progress" fill="#10B981"  />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
