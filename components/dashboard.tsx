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
import { useToast } from "@/components/ui/toast"
import { Input } from "@/components/ui/input"
import { getUserData, getLeaderboardData, updateTopic, updateProfile } from '../app/dashboard/action'
import { User, Topic, LeaderboardEntry, Badge } from '../app/dashboard/types'
import {  Github, Star, TrendingUp } from 'lucide-react'
import ModernBadges from '@/components//ui/ModernBadges'; 
import StreakHeatmap from '@/components//ui/StreakHeatMap';


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

export default function DashboardComponent() {
  const [activeTab, setActiveTab] = useState('progress')
  const [topics, setTopics] = useState<Topic[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null)
  const [heatmapData, setHeatmapData] = useState([])
  const { toast } = useToast()
  const router = useRouter()
  



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
    const newTopics = [...topics];
    newTopics[index] = { ...newTopics[index], [field]: value };
    setTopics(newTopics);
 
    try {
      const updatedTopic = await updateTopic(newTopics[index].name, field, value)
      newTopics[index] = updatedTopic
      setTopics(newTopics)
      fetchUserData() // Refresh user data to get updated streak and points
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

  const handleProfileUpdate = async (leetcodeUrl: string, githubUrl: string) => {
    try {
      const updatedUser = await updateProfile(leetcodeUrl, githubUrl)
      setCurrentUser(updatedUser)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: "destructive",
      })
    }
  }

  const overallProgress = Math.round(topics.reduce((sum, topic) => sum + topic.progress, 0) / topics.length)

  const leaderboardWithCurrentUser = [
    ...leaderboard.filter(user => user.name !== currentUser?.username),
    { name: 'You', progress: overallProgress, avatar: '/placeholder.svg?height=40&width=40', topics: topics, streak: currentUser?.streak || 0, points: currentUser?.points || 0 ,githubUrl: currentUser?.githubUrl, leetcodeUrl: currentUser?.leetcodeUrl},
  ].sort((a, b) => b.progress - a.progress);

  const CustomXAxisTick = ({ x, y, payload }: { x: number, y: number, payload: { value: string } }) => {
    return (
      <g transform={`translate(${x},${y})`} >
        <text
          x={0}
          y={0}
          dy={16}
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

  const renderBadges = (badges: Badge[]) => (  <ModernBadges badges={badges} />)

  const fetchHeatmapData = async () => {
    try {
      const response = await fetch('/api/heatmap-data')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setHeatmapData(data)
    } catch (error) {
      console.error('Failed to fetch heatmap data:', error)
      toast({
        title: "Error",
        description: "Failed to load activity data. Please try again later.",
        variant: "destructive",
      })
    }
  }




  useEffect(() => {
    fetchUserData();
    fetchLeaderboardData();
    fetchHeatmapData();
  }, []);
  

  return (
    <div className="container mx-auto p-4 bg-stone-950 text-white min-h-screen">
    <h1 className="text-4xl font-bold mb-6 text-green-300">DSA Progress Tracker</h1>
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-4 bg-green-900">
        <TabsTrigger value="progress" className="data-[state=active]:bg-green-700">My Progress</TabsTrigger>
        <TabsTrigger value="leaderboard" className="data-[state=active]:bg-green-700">Leaderboard</TabsTrigger>
      </TabsList>

{/* OVERALL PROGRESS */}
<TabsContent value="progress">
          <Card className="mb-6 bg-black border-yellow-900">
            <CardHeader>
              <CardTitle className="text-green-500">Overall Progress</CardTitle>
              <CardDescription className="text-gray-400">Your total DSA learning progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center space-x-4">
                <RadialProgress value={overallProgress} size={200} />
              </div>
            </CardContent>


{/* BADGES SECTION */}
            <CardHeader>
              <CardTitle className="text-green-500">Badges</CardTitle>
            </CardHeader>
            <CardContent>
              {currentUser && renderBadges(currentUser.badges)}
            </CardContent>
              <StreakHeatmap data={heatmapData} />
             {/* <StreakHeatmap data={heatmapData} /> */}
          </Card>


        
{/* TOPICS SECTION */}
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
                  height={100}
                  interval={0}
                  />
                  <YAxis stroke="#fff" />
                  <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #10B981',color:'white'  }} />
                  <Bar dataKey="progress" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>



{/* LEADERBOARD SECTION */}
<TabsContent value="leaderboard">
  <Card className="bg-black border-yellow-900">
    <CardHeader>
      <CardTitle className="text-green-500">Leaderboard</CardTitle>
      <CardDescription className="text-gray-400">See how you rank among your peers</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-4">
        {leaderboardWithCurrentUser.map((user, index) => (
          <li key={user.name} className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <span className="font-bold text-gray-200 w-6 text-right">{index + 1}.</span>
              <Avatar className="hidden sm:inline-block">
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <Button variant="link" onClick={() => setSelectedUser(user)} className="text-green-500 p-0">
                {user.name === 'You' ? <span className="font-bold">{user.name}</span> : user.name}
              </Button>
            </div>
            <div className="flex flex-wrap items-center justify-end space-x-2 sm:space-x-4 w-full sm:w-auto">
              <span className="text-yellow-500 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" /> {user.streak}
              </span>
              <span className="text-blue-500 flex items-center">
                <Star className="w-4 h-4 mr-1" /> {user.points}
              </span>
              <div className="flex items-center space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
                <Progress value={user.progress} className="w-full sm:w-24 bg-gray-700" />
                <span className="text-green-500 w-12 text-right">{user.progress}%</span>
              </div>
            </div>
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
      <CardContent className="h-[300px] sm:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={selectedUser.topics}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }} 
          >
            <XAxis dataKey="name" 
              stroke="#fff"
              tick={CustomXAxisTick}
              height={100}
              interval={0} 
            />
            <YAxis stroke="#fff" />
            <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #10B981', color:'white' }}  />
            <Bar dataKey="progress" fill="#10B981"  />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
      <div className='links flex justify-center items-center my-2 space-x-2'>
        <Button className='github' onClick={() => window.open(selectedUser.githubUrl, '_blank')}>
          <Github size={24} />
        </Button>
        <Button className='leetcode' onClick={() => window.open(selectedUser.leetcodeUrl, '_blank')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="leetcode" height={24} width={24}>
            <path fill="#B3B1B0" d="M22 14.355c0-.742-.564-1.346-1.26-1.346H10.676c-.696 0-1.26.604-1.26 1.346s.563 1.346 1.26 1.346H20.74c.696.001 1.26-.603 1.26-1.346z"></path>
            <path fill="#E7A41F" d="m3.482 18.187 4.313 4.361c.973.979 2.318 1.452 3.803 1.452 1.485 0 2.83-.512 3.805-1.494l2.588-2.637c.51-.514.492-1.365-.039-1.9-.531-.535-1.375-.553-1.884-.039l-2.676 2.607c-.462.467-1.102.662-1.809.662s-1.346-.195-1.81-.662l-4.298-4.363c-.463-.467-.696-1.15-.696-1.863 0-.713.233-1.357.696-1.824l4.285-4.38c.463-.467 1.116-.645 1.822-.645s1.346.195 1.809.662l2.676 2.606c.51.515 1.354.497 1.885-.038.531-.536.549-1.387.039-1.901l-2.588-2.636a4.994 4.994 0 0 0-2.392-1.33l-.034-.007 2.447-2.503c.512-.514.494-1.366-.037-1.901-.531-.535-1.376-.552-1.887-.038l-10.018 10.1C2.509 11.458 2 12.813 2 14.311c0 1.498.509 2.896 1.482 3.876z"></path>
            <path fill="#070706" d="M8.115 22.814a2.109 2.109 0 0 1-.474-.361c-1.327-1.333-2.66-2.66-3.984-3.997-1.989-2.008-2.302-4.937-.786-7.32a6 6 0 0 1 .839-1.004L13.333.489c.625-.626 1.498-.652 2.079-.067.56.563.527 1.455-.078 2.066-.769.776-1.539 1.55-2.309 2.325-.041.122-.14.2-.225.287-.863.876-1.75 1.729-2.601 2.618-.111.116-.262.186-.372.305-1.423 1.423-2.863 2.83-4.266 4.272-1.135 1.167-1.097 2.938.068 4.127 1.308 1.336 2.639 2.65 3.961 3.974.067.067.136.132.204.198.468.303.474 1.25.183 1.671-.321.465-.74.75-1.333.728-.199-.006-.363-.086-.529-.179z"></path>
          </svg>
        </Button>
      </div>
    </Card>
  )}
</TabsContent>
      </Tabs>

      {/* PROFILE UPDATE POP UP */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4 bg-green-700 hover:bg-yellow-600">Update Links</Button>
        </DialogTrigger>
        <DialogContent className="bg-black border-yellow-900">
          <DialogHeader>
            <DialogTitle className="text-green-500">Update Links</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Leetcode Proile URL</label>
              <Input
                type="url"
                placeholder="https://www.leetcode.com/in/yourusername"
                value={currentUser?.leetcodeUrl || ''}
                onChange={(e) => setCurrentUser(prev => prev ? { ...prev, leetcodeUrl: e.target.value } : null)}
                className="bg-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400">GitHub DSA Notes Repo URL</label>
              <Input
                type="url"
                placeholder="https://github.com/yourusername"
                value={currentUser?.githubUrl || ''}
                onChange={(e) => setCurrentUser(prev => prev ? { ...prev, githubUrl: e.target.value } : null)}
                className="bg-gray-700 text-white"
              />
            </div>
            <Button onClick={() => currentUser && handleProfileUpdate(currentUser.leetcodeUrl || '', currentUser.githubUrl || '')} className="bg-green-700 hover:bg-yellow-600">
              Save Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


