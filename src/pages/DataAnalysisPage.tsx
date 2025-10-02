 import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Lightbulb, Loader } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import customerData from '@/assets/customer_w2.json';
import ownerData from '@/assets/owners_w2.json';
import vrollData from '@/assets/vroll.json';
import buildingData from '@/assets/building_footprintsw2.json';

const API_KEY_STORAGE_KEY = "gemini_api_key";

const DataAnalysisPage: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setApiKey("AIzaSyA_9qiO0Qv5PfEPWxzj5BuTNfb3MRWvTic"); // Default API key if none is stored
    }
  }, []);

  const getGenerativeModel = () => {
    if (!apiKey) {
      setError("API Key is not set. Please configure it in settings.");
      return null;
    }
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    } catch (e: any) {
      setError(`Failed to initialize AI: ${e.message}`);
      return null;
    }
  };

  const generateSuggestedQuestions = async () => {
    setLoading(true);
    setError('');

    const model = getGenerativeModel();
    if (!model) {
      setLoading(false);
      return;
    }

    try {
      const dataContext = serializeDataForAI();
      const prompt = `Based on the following data summary, generate 5 insightful questions that a user might ask. Return the questions as a numbered list.

      Data Context:
      ${dataContext}
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      // Parse the numbered list of questions from the AI's response
      const questions = text.split('\n').filter(q => q.trim().length > 0 && /^\d+\./.test(q.trim()));
      setSuggestedQuestions(questions.map(q => q.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')));

    } catch (e: any) {
      setError(`Failed to generate suggested questions: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const serializeDataForAI = () => {
    let dataContext = "The following data is available for analysis:\n\n";

    if (customerData.length > 0) {
      dataContext += "Property Occupant Information:\n";
      customerData.slice(0, 5).forEach(c => {
        dataContext += `- Customer ID: ${c.customer_id}, Name: ${c.customer_name}, Section: ${c.section}, Lot: ${c['lot(s)']}\n`;
      });
      if (customerData.length > 5) dataContext += `... (and ${customerData.length - 5} more customer records)\n`;
      dataContext += "\n";
    }

    if (ownerData.length > 0) {
      dataContext += "Land Ownership Records:\n";
      ownerData.slice(0, 5).forEach(o => {
        dataContext += `- Owner ID: ${o.owner_id}, Name: ${o['name ']}, Parcel ID: ${o.parcel_id}, Lot: ${o['lot(s)']}\n`;
      });
      if (ownerData.length > 5) dataContext += `... (and ${ownerData.length - 5} more owner records)\n`;
      dataContext += "\n";
    }

    if (vrollData.length > 0) {
      dataContext += "Tax Valuation Records:\n";
      vrollData.slice(0, 5).forEach(v => {
        dataContext += `- Valuation No: ${v['val no.']}, Parcel ID: ${v.parcel_id}, Assessed UV (K): ${v['assessed UV (K)']}, Lot: ${v['lot(s)']}\n`;
      });
      if (vrollData.length > 5) dataContext += `... (and ${vrollData.length - 5} more valuation records)\n`;
      dataContext += "\n";
    }

    if (buildingData.features.length > 0) {
      dataContext += "Building Layout Information:\n";
      buildingData.features.slice(0, 5).forEach(b => {
        dataContext += `- Building ID: ${b.properties.building_i}, Parcel ID: ${b.properties.parcel_id}, Area: ${b.properties.area_sq_m}\n`;
      });
      if (buildingData.features.length > 5) dataContext += `... (and ${buildingData.features.length - 5} more building records)\n`;
      dataContext += "\n";
    }

    if (dataContext === "The following data is available for analysis:\n\n") {
      dataContext += "No data currently available.";
    }

    return dataContext;
  };

  const handleAskQuestion = async (q: string = question) => {
    if (!q.trim()) {
      setError("Please enter a question.");
      return;
    }
    setLoading(true);
    setError('');
    setResponse('');

    const model = getGenerativeModel();
    if (!model) {
      setLoading(false);
      return;
    }

    try {
      const dataContext = serializeDataForAI();

      const fullPrompt = `Given the following GIS property data, tax records, and customer lot information, answer the user's question. Summarize your analysis into a single, precise paragraph.
      Data Context:
      ${dataContext}

      User Question: ${q}
      `;

      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();
      setResponse(text);
    } catch (e: any) {
      setError(`Failed to get AI response: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestionClick = (q: string) => {
    setQuestion(q);
    handleAskQuestion(q);
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" /> Data Analysis with AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ask questions about your GIS data to get insights from the AI.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about the data..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAskQuestion();
                }
              }}
              disabled={dataLoading}
            />
            <Button onClick={() => handleAskQuestion()} disabled={loading || dataLoading}>
              {loading ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Ask AI"
              )}
            </Button>
            <Button variant="outline" onClick={() => { setQuestion(''); setResponse(''); setError(''); }} disabled={loading || dataLoading}>
              Clear
            </Button>
          </div>
          {dataLoading && <p className="text-blue-500 text-sm">Loading data for analysis...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {loading && !response && (
            <div className="flex items-center justify-center p-8">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {response && (
            <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-secondary/20">
              <div className="prose dark:prose-invert">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6" /> Suggested Insight Questions
            </div>
            <Button
              variant="outline"
              onClick={generateSuggestedQuestions}
              disabled={dataLoading || loading}
            >
              Generate Analysis Questions
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {suggestedQuestions.map((q, index) => (
            <Button
              key={index}
              variant="outline"
              className="text-left h-auto whitespace-normal"
              onClick={() => handleSuggestedQuestionClick(q)}
              disabled={dataLoading}
            >
              {q}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataAnalysisPage;
