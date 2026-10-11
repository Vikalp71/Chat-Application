export const currentUser = {
  id: "u1",
  name: "Vikalp Bajpai",
  username: "vikalp",
  avatar: "https://i.pravatar.cc/150?img=12",
  status: "Online",
};

export const users = [
  {
    id: "u2",
    name: "Rahul Sharma",
    username: "rahul",
    avatar: "https://i.pravatar.cc/150?img=11",
    status: "Online",
    lastSeen: "Online",
  },
  {
    id: "u3",
    name: "Ayush Kumar",
    username: "ayush",
    avatar: "https://i.pravatar.cc/150?img=13",
    status: "Away",
    lastSeen: "5 min ago",
  },
  {
    id: "u4",
    name: "Priya Singh",
    username: "priya",
    avatar: "https://i.pravatar.cc/150?img=47",
    status: "Online",
    lastSeen: "Online",
  },
  {
    id: "u5",
    name: "Aman Verma",
    username: "aman",
    avatar: "https://i.pravatar.cc/150?img=14",
    status: "Offline",
    lastSeen: "Yesterday",
  },
  {
    id: "u6",
    name: "Neha Gupta",
    username: "neha",
    avatar: "https://i.pravatar.cc/150?img=44",
    status: "Online",
    lastSeen: "Online",
  },
];

export const conversations = [
  {
    id: "c1",
    userId: "u2",
    name: "Rahul Sharma",
    avatar: "https://i.pravatar.cc/150?img=11",
    status: "Online",
    lastMessage: "Okay, I will check it.",
    time: "10:42 PM",
    unread: 2,
  },
  {
    id: "c2",
    userId: "u3",
    name: "Ayush Kumar",
    avatar: "https://i.pravatar.cc/150?img=13",
    status: "Away",
    lastMessage: "The project looks great!",
    time: "9:30 PM",
    unread: 0,
  },
  {
    id: "c3",
    userId: "u4",
    name: "Priya Singh",
    avatar: "https://i.pravatar.cc/150?img=47",
    status: "Online",
    lastMessage: "See you tomorrow 😊",
    time: "Yesterday",
    unread: 0,
  },
  {
    id: "c4",
    userId: "u5",
    name: "Aman Verma",
    avatar: "https://i.pravatar.cc/150?img=14",
    status: "Offline",
    lastMessage: "Thanks bro!",
    time: "Yesterday",
    unread: 0,
  },
];

export const messagesData = {
  u2: [
    {
      id: 1,
      senderId: "u2",
      text: "Hey! How are you?",
      time: "10:35 PM",
    },
    {
      id: 2,
      senderId: "u1",
      text: "I'm good bro. What about you?",
      time: "10:36 PM",
    },
    {
      id: 3,
      senderId: "u2",
      text: "I'm doing great.",
      time: "10:37 PM",
    },
    {
      id: 4,
      senderId: "u2",
      text: "Did you check the new project?",
      time: "10:39 PM",
    },
    {
      id: 5,
      senderId: "u1",
      text: "Yes, I checked it. The UI looks really good.",
      time: "10:40 PM",
    },
    {
      id: 6,
      senderId: "u2",
      text: "Okay, I will check it.",
      time: "10:42 PM",
    },
  ],

  u3: [
    {
      id: 7,
      senderId: "u3",
      text: "Hello!",
      time: "9:25 PM",
    },
    {
      id: 8,
      senderId: "u1",
      text: "Hey Ayush 👋",
      time: "9:27 PM",
    },
    {
      id: 9,
      senderId: "u3",
      text: "The project looks great!",
      time: "9:30 PM",
    },
  ],

  u4: [
    {
      id: 10,
      senderId: "u4",
      text: "Are you coming tomorrow?",
      time: "Yesterday",
    },
    {
      id: 11,
      senderId: "u1",
      text: "Yes, definitely.",
      time: "Yesterday",
    },
    {
      id: 12,
      senderId: "u4",
      text: "See you tomorrow 😊",
      time: "Yesterday",
    },
  ],

  u5: [
    {
      id: 13,
      senderId: "u5",
      text: "Can you send me the files?",
      time: "Yesterday",
    },
    {
      id: 14,
      senderId: "u1",
      text: "Sure, I'll send them.",
      time: "Yesterday",
    },
    {
      id: 15,
      senderId: "u5",
      text: "Thanks bro!",
      time: "Yesterday",
    },
  ],
};