 import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Lightbulb } from "lucide-react";
import { fetchAllTaxRecords, fetchAllProperties, fetchAllCustomerLots, fetchAllOwners, TaxRecord, Property, CustomerLot, Owner } from "@/integrations/supabase/services";

const API_KEY_STORAGE_KEY = "gemini_api_key";

const DataAnalysisPage: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [customerLots, setCustomerLots] = useState<CustomerLot[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]); // New state for owners data
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      setApiKey("AIzaSyA_9qiO0Qv5PfEPWxzj5BuTNfb3MRWvTic"); // Default API key if none is stored
    }
    generateInitialSuggestedQuestions();

    const fetchData = async () => {
      setDataLoading(true);
      try {
        const fetchedTaxRecords = await fetchAllTaxRecords();
        if (fetchedTaxRecords) setTaxRecords(fetchedTaxRecords);
        const fetchedProperties = await fetchAllProperties();
        if (fetchedProperties) setProperties(fetchedProperties);
        const fetchedCustomerLots = await fetchAllCustomerLots();
        if (fetchedCustomerLots) setCustomerLots(fetchedCustomerLots);
        const fetchedOwners = await fetchAllOwners(); // Fetch owners data
        if (fetchedOwners) setOwners(fetchedOwners); // Set owners data
      } catch (e: any) {
        setError(`Failed to fetch data: ${e.message}`);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
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

  const generateInitialSuggestedQuestions = () => {
    const allQuestions = [
      "What is the total outstanding tax amount across all tax records?",
      "Identify properties with 'Commercial' land use that also have associated customer lots.",
      "What is the average 'Last Valuation Year' for properties?",
      "Show me the top 5 customers by the number of lots they own.",
      "Are there any properties with discrepancies between their 'Land Use' in property data and 'Ward' in customer lots data?",
      "List all properties with 'Building Details' specified as 'Residential'.",
      "Which property address has the most recent 'Last Valuation Year'?",
      "Summarize the tax payment statuses.",
      "Find all customer lots in 'Section 0006'.",
      "What is the distribution of 'Land Details' across properties?",
      "What is the total number of properties in the dataset?",
      "How many tax records have an 'Unpaid' status?",
      "What is the average 'Amount Due' for tax records?",
      "List all unique 'Land Details' categories present in the properties data.",
      "Which 'Ward' has the most customer lots?",
      "Identify properties with missing 'Building Details'.",
      "What is the most common 'Building Details' type?",
      "Find all tax records for 'DON ANJO'.",
      "What is the total number of customer lots?",
      "Are there any properties with a 'Last Valuation Year' before 2000?"
    ];

    // Shuffle the questions to provide a "random" order
    const shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
    // Take a subset, e.g., the first 10, or all if less than 10
    setSuggestedQuestions(shuffledQuestions.slice(0, 10));
  };

  const serializeDataForAI = () => {
    let dataContext = "Available GIS data includes:\n\n";

    if (properties.length > 0) {
      dataContext += "Properties:\n";
      properties.slice(0, 5).forEach(p => { // Limit to first 5 for brevity
        dataContext += `- ID: ${p.property_id}, Address: ${p.address}, Land Details: ${p.land_details}, Building Details: ${p.building_details}, Last Valuation Year: ${p.last_valuation_year}, Owner User ID: ${p.owner_user_id}\n`;
      });
      if (properties.length > 5) dataContext += `... (and ${properties.length - 5} more properties)\n`;
      dataContext += "\n";
    }

    if (taxRecords.length > 0) {
      dataContext += "Tax Records:\n";
      taxRecords.slice(0, 5).forEach(t => { // Limit to first 5 for brevity
        dataContext += `- ID: ${t.tax_record_id}, Property ID: ${t.property_id}, Customer: ${t.customer_name}, Amount Due: ${t.amount_due}, Status: ${t.payment_status}\n`;
      });
      if (taxRecords.length > 5) dataContext += `... (and ${taxRecords.length - 5} more tax records)\n`;
      dataContext += "\n";
    }

    if (customerLots.length > 0) {
      dataContext += "Customer Lots:\n";
      customerLots.slice(0, 5).forEach(c => { // Limit to first 5 for brevity
        dataContext += `- ID: ${c.id}, Customer: ${c.customer_name}, Lot: ${c.lot_number}, Section: ${c.section}, Ward: ${c.ward}, Address: ${c.address}\n`;
      });
      if (customerLots.length > 5) dataContext += `... (and ${customerLots.length - 5} more customer lots)\n`;
      dataContext += "\n";
    }

    if (owners.length > 0) {
      dataContext += "Owners:\n";
      owners.slice(0, 5).forEach(o => { // Limit to first 5 for brevity
        dataContext += `- ID: ${o.owner_id}, Name: ${o.owner_name}, Parcel ID: ${o.parcel_id}, Contact: ${o.contact_info}, Title Ref: ${o.title_reference}, Lease Term: ${o.term_of_lease}, Grant Date: ${o.date_of_grant}\n`;
      });
      if (owners.length > 5) dataContext += `... (and ${owners.length - 5} more owners)\n`;
      dataContext += "\n";
    }

    if (dataContext === "Available GIS data includes:\n\n") {
      dataContext += "No data currently available. Please ensure data sources are configured and accessible.";
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

      const fullPrompt = `Given the following GIS property data, tax records, and customer lot information, answer the user's question and provide relevant insights. Focus on the provided data.
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
              {loading ? "Analyzing..." : "Ask AI"}
            </Button>
            <Button variant="outline" onClick={() => { setQuestion(''); setResponse(''); setError(''); }} disabled={loading || dataLoading}>
              Clear
            </Button>
          </div>
          {dataLoading && <p className="text-blue-500 text-sm">Loading data for analysis...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {response && (
            <ScrollArea className="h-[500px] w-full rounded-md border p-4 bg-secondary/20">
              <p className="whitespace-pre-wrap">{response}</p>
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
              onClick={generateInitialSuggestedQuestions}
              disabled={dataLoading}
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
