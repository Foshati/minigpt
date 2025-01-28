'use client';

import { useState, useEffect } from 'react';
import {  Sparkles, X } from 'lucide-react';
import { type Message } from '@/components/ui/chat-message';
import { Chat } from '@/components/ui/chat';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ChatConfig {
  apiKey: string;
  model: string;
}

interface ChatDemoProps {
  initialMessages?: Message[];
}

export function ChatDemo({ initialMessages = [] }: ChatDemoProps) {
  const [config, setConfig] = useState<ChatConfig>({ apiKey: '', model: '' });
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat-config');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, []);

  const processMessage = async (userMessage: Message) => {
    if (!config.apiKey || !config.model) {
      setError('Please configure API settings first');
      setIsModalOpen(true);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          apiKey: config.apiKey,
          model: config.model,
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to read stream');

      let content = '';
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '',
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        content += new TextDecoder().decode(value);
        assistantMessage.content = content;
        
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return last?.role === 'assistant' 
            ? [...prev.slice(0, -1), assistantMessage] 
            : [...prev, assistantMessage];
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process message');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setInput('');
    setMessages(prev => [...prev, userMessage]);
    await processMessage(userMessage);
  };

  const handleConfigSave = async () => {
    if (!config.apiKey || !config.model) {
      setError('Please fill all fields');
      return;
    }

    try {
      localStorage.setItem('chat-config', JSON.stringify(config));
      setIsModalOpen(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError('Failed to save configuration');
    }
  };

  return (
    <div className="relative w-full h-full">
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            size="icon"
            className="absolute right-4 top-4 z-50 rounded-full"
            variant="ghost"
          >
            <Sparkles className="text-primary" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>API Configuration</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>HuggingFace API Key</Label>
              <Input
                type="password"
                value={config.apiKey}
                onChange={e => setConfig(p => ({ ...p, apiKey: e.target.value }))}
                placeholder="hf_..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Model Name</Label>
              <Input
                value={config.model}
                onChange={e => setConfig(p => ({ ...p, model: e.target.value }))}
                placeholder="gpt2, facebook/opt-350m..."
              />
            </div>
            
            {error && (
              <Alert variant="destructive">
                <X className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={handleConfigSave}
              disabled={!config.apiKey || !config.model}
            >
              Save Configuration
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="h-[calc(100vh-160px)] overflow-hidden">
        <Chat
          messages={messages}
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          isGenerating={isLoading}
          suggestions={[
            'Explain quantum computing in simple terms',
            'What is the meaning of life?',
            'How does photosynthesis work?'
          ]}
          error={error}
          onErrorDismiss={() => setError('')}
        />
      </div>
    </div>
  );
}