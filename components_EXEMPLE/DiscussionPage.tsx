import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { 
  MessageCircle,
  Send,
  Hash,
  Users,
  Bell,
  Search,
  Plus,
  MoreVertical,
  Pin,
  Smile,
  Paperclip,
  Mic,
  Video
} from 'lucide-react';

interface DiscussionPageProps {
  isMobile?: boolean;
}

interface Channel {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  unreadCount?: number;
  isGeneral: boolean;
  category: 'general' | 'modules' | 'help';
}

interface Message {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: 'student' | 'instructor' | 'admin';
  };
  content: string;
  timestamp: string;
  isPinned?: boolean;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

const channels: Channel[] = [
  {
    id: 'general',
    name: 'général',
    description: 'Discussion générale de la communauté',
    memberCount: 1247,
    unreadCount: 3,
    isGeneral: true,
    category: 'general'
  },
  {
    id: 'recettes-risquees',
    name: 'recettes-risquées',
    description: 'Stratégies à haut rendement et discussions crypto',
    memberCount: 892,
    unreadCount: 12,
    isGeneral: false,
    category: 'modules'
  },
  {
    id: 'ingredients-defi',
    name: 'ingrédients-defi',
    description: 'Yield farming, staking et DeFi',
    memberCount: 654,
    unreadCount: 5,
    isGeneral: false,
    category: 'modules'
  },
  {
    id: 'help-support',
    name: 'aide-support',
    description: 'Besoin d\'aide ? Posez vos questions ici',
    memberCount: 1156,
    unreadCount: 8,
    isGeneral: false,
    category: 'help'
  },
  {
    id: 'success-stories',
    name: 'success-stories',
    description: 'Partagez vos réussites et témoignages',
    memberCount: 423,
    isGeneral: false,
    category: 'general'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    author: {
      name: 'Alexandre Martin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      role: 'instructor'
    },
    content: 'Bienvenue dans le canal général ! N\'hésitez pas à vous présenter et à poser vos questions 🚀',
    timestamp: '14:32',
    isPinned: true,
    reactions: [
      { emoji: '👋', count: 24, users: [] },
      { emoji: '🚀', count: 18, users: [] }
    ]
  },
  {
    id: '2',
    author: {
      name: 'Marie Dubois',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      role: 'student'
    },
    content: 'Salut tout le monde ! Je viens de finir le module e-commerce, quelqu\'un a des conseils pour l\'optimisation des conversions ?',
    timestamp: '15:45'
  },
  {
    id: '3',
    author: {
      name: 'Thomas Bernard',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      role: 'student'
    },
    content: 'Super question Marie ! Personnellement j\'ai vu une amélioration de 35% en appliquant les techniques du module sur les landing pages 📈',
    timestamp: '15:52',
    reactions: [
      { emoji: '💯', count: 5, users: [] }
    ]
  }
];

export function DiscussionPage({ isMobile = false }: DiscussionPageProps) {
  const [selectedChannel, setSelectedChannel] = useState<Channel>(channels[0]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Logique d'envoi de message
      setNewMessage('');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'instructor':
        return 'text-orange-500';
      case 'admin':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'instructor':
        return <Badge className="bg-orange-500/20 text-orange-500 text-xs ml-2">Formateur</Badge>;
      case 'admin':
        return <Badge className="bg-red-500/20 text-red-500 text-xs ml-2">Admin</Badge>;
      default:
        return null;
    }
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-black">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Hash className="w-5 h-5 text-orange-500 mr-2" />
              <h2 className="text-white font-semibold">{selectedChannel.name}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-1">{selectedChannel.description}</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {mockMessages.map((message) => (
            <div key={message.id} className={`flex space-x-3 ${message.isPinned ? 'bg-orange-500/5 p-3 rounded-lg border border-orange-500/20' : ''}`}>
              {message.isPinned && (
                <div className="absolute -top-2 left-3">
                  <Pin className="w-4 h-4 text-orange-500" />
                </div>
              )}
              <ImageWithFallback
                src={message.author.avatar}
                alt={message.author.name}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-sm font-medium ${getRoleColor(message.author.role)}`}>
                    {message.author.name}
                  </span>
                  {getRoleBadge(message.author.role)}
                  <span className="text-xs text-gray-500">{message.timestamp}</span>
                </div>
                <p className="text-gray-300 text-sm">{message.content}</p>
                {message.reactions && (
                  <div className="flex items-center space-x-2 mt-2">
                    {message.reactions.map((reaction, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="bg-gray-800/50 hover:bg-gray-700 text-xs px-2 py-1 h-auto"
                      >
                        {reaction.emoji} {reaction.count}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message #${selectedChannel.name}`}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 resize-none min-h-[40px] max-h-[120px]"
                rows={1}
              />
              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                  <Paperclip className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="focus-btn-primary"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-black">
      {/* Channels Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center">
              <MessageCircle className="w-5 h-5 text-orange-500 mr-2" />
              Canaux de discussion
            </h2>
            <Button variant="ghost" size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Rechercher des canaux"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 pl-10"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                  selectedChannel.id === channel.id
                    ? 'bg-orange-500/20 border border-orange-500/30 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center flex-1">
                  <Hash className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="text-sm font-medium">{channel.name}</div>
                    <div className="text-xs text-gray-500 truncate">{channel.description}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {channel.unreadCount && (
                    <Badge className="bg-orange-500 text-black text-xs px-2 py-0.5">
                      {channel.unreadCount}
                    </Badge>
                  )}
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="w-3 h-3 mr-1" />
                    {channel.memberCount}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Hash className="w-5 h-5 text-orange-500 mr-2" />
              <div>
                <h3 className="text-white font-semibold">{selectedChannel.name}</h3>
                <p className="text-gray-400 text-sm">{selectedChannel.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-gray-600 text-gray-300">
                <Users className="w-3 h-3 mr-1" />
                {selectedChannel.memberCount} membres
              </Badge>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {mockMessages.map((message) => (
            <div key={message.id} className={`relative ${message.isPinned ? 'bg-orange-500/5 p-4 rounded-lg border border-orange-500/20' : ''}`}>
              {message.isPinned && (
                <div className="absolute -top-2 left-4 bg-orange-500 text-black px-2 py-0.5 rounded text-xs font-medium flex items-center">
                  <Pin className="w-3 h-3 mr-1" />
                  Message épinglé
                </div>
              )}
              <div className="flex space-x-4">
                <ImageWithFallback
                  src={message.author.avatar}
                  alt={message.author.name}
                  className="w-10 h-10 rounded-full flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`font-medium ${getRoleColor(message.author.role)}`}>
                      {message.author.name}
                    </span>
                    {getRoleBadge(message.author.role)}
                    <span className="text-sm text-gray-500">{message.timestamp}</span>
                  </div>
                  <p className="text-gray-300 mb-3">{message.content}</p>
                  {message.reactions && (
                    <div className="flex items-center space-x-2">
                      {message.reactions.map((reaction, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="bg-gray-800/50 hover:bg-gray-700 text-sm px-3 py-1 h-auto rounded-full"
                        >
                          {reaction.emoji} {reaction.count}
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-gray-400 hover:text-orange-500"
                      >
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-800 bg-gray-900">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Message #${selectedChannel.name}`}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 resize-none min-h-[60px] max-h-[120px]"
                rows={2}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500">
                    <Mic className="w-4 h-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="focus-btn-primary"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Envoyer
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}