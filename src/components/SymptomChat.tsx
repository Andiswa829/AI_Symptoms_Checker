import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Send, ArrowLeft, Bot, User } from 'lucide-react';
import { Symptom } from '../types/doctor';
import { ChatMessage } from '../types/outbreaks';

interface SymptomChatProps {
  symptoms: Symptom[];
  messages: ChatMessage[];
  onAddMessage: (content: string, type: 'user' | 'ai') => void;
  onAnalyze: () => void;
  onBack: () => void;
}

const predefinedQuestions = [
  "Do you have a fever?",
  "Are you experiencing any pain? If so, where?",
  "Have you noticed any changes in your appetite?",
  "Are you having trouble sleeping?",
  "Have you been in contact with anyone who was sick recently?",
  "Are you taking any medications currently?",
  "Do you have any known allergies?",
  "Have you traveled recently?",
];

export function SymptomChat({ symptoms, messages, onAddMessage, onAnalyze, onBack }: SymptomChatProps) {
  const [inputValue, setInputValue] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      // Start conversation
      setTimeout(() => {
        onAddMessage(
          `Thank you for providing your symptoms. I'd like to ask a few follow-up questions to better understand your condition. ${predefinedQuestions[0]}`,
          'ai'
        );
      }, 500);
    }
  }, [messages.length, onAddMessage]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      onAddMessage(inputValue.trim(), 'user');
      setInputValue('');
      
      // Simulate AI response
      setTimeout(() => {
        if (currentQuestionIndex < predefinedQuestions.length - 1) {
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          onAddMessage(predefinedQuestions[nextIndex], 'ai');
        } else {
          onAddMessage(
            "Thank you for providing all that information. I now have enough details to analyze your symptoms. Would you like me to proceed with the analysis?",
            'ai'
          );
        }
      }, 1000);
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    onAddMessage("Starting comprehensive analysis of your symptoms...", 'ai');
    
    setTimeout(() => {
      onAnalyze();
    }, 2000);
  };

  const handleQuickResponse = (response: string) => {
    onAddMessage(response, 'user');
    
    setTimeout(() => {
      if (currentQuestionIndex < predefinedQuestions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        onAddMessage(predefinedQuestions[nextIndex], 'ai');
      } else {
        onAddMessage(
          "Thank you for providing all that information. I now have enough details to analyze your symptoms. Would you like me to proceed with the analysis?",
          'ai'
        );
      }
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Symptoms
        </Button>
        <h1 className="text-3xl text-primary mb-2">Symptom Assessment</h1>
        <p className="text-muted-foreground">
          Please answer these follow-up questions to help with analysis
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="h-5 w-5 mr-2" />
                AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 ${
                        message.type === 'user' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg p-3 max-w-[80%] ${
                          message.type === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="mt-4 space-y-3">
                {messages.length > 0 && 
                 messages[messages.length - 1]?.type === 'ai' && 
                 messages[messages.length - 1]?.content.includes('proceed with the analysis') && (
                  <div className="flex gap-2">
                    <Button onClick={handleAnalyze} disabled={isAnalyzing} className="flex-1">
                      {isAnalyzing ? 'Analyzing...' : 'Yes, Analyze My Symptoms'}
                    </Button>
                  </div>
                )}
                
                {messages.length > 0 && 
                 messages[messages.length - 1]?.type === 'ai' && 
                 !messages[messages.length - 1]?.content.includes('proceed with the analysis') &&
                 !messages[messages.length - 1]?.content.includes('Starting comprehensive') && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleQuickResponse('Yes')} size="sm">
                      Yes
                    </Button>
                    <Button variant="outline" onClick={() => handleQuickResponse('No')} size="sm">
                      No
                    </Button>
                    <Button variant="outline" onClick={() => handleQuickResponse('Not sure')} size="sm">
                      Not sure
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your response..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isAnalyzing}
                  />
                  <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isAnalyzing}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Symptoms Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {symptoms.map((symptom) => (
                <div key={symptom.id} className="border rounded-lg p-3">
                  <h4 className="capitalize text-sm">{symptom.description}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className={`px-2 py-1 rounded text-xs ${
                      symptom.severity === 'mild' ? 'bg-green-100 text-green-800' :
                      symptom.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {symptom.severity}
                    </span>
                    <span>{symptom.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}