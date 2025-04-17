'use client';

import { useState } from 'react';
import { INDUSTRIES, CONTENT_RATINGS_BY_INDUSTRY, GENRES, YEARS } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface RecommendationFormProps {
  onSubmit: (values: {
    industry: string;
    year: string;
    genre: string;
    contentRating: string;
  }) => void;
  isLoading?: boolean;
}

export function RecommendationForm({ onSubmit, isLoading }: RecommendationFormProps) {
  const [industry, setIndustry] = useState('');
  const [year, setYear] = useState('');
  const [genre, setGenre] = useState('');
  const [contentRating, setContentRating] = useState('');

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    setContentRating(''); // Reset content rating when industry changes
  };

  const handleSubmit = () => {
    onSubmit({
      industry,
      year,
      genre,
      contentRating,
    });
  };

  const availableContentRatings = industry ? CONTENT_RATINGS_BY_INDUSTRY[industry as keyof typeof CONTENT_RATINGS_BY_INDUSTRY] : [];

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Select value={industry} onValueChange={handleIndustryChange}>
            <SelectTrigger id="industry">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  {industry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="year">Release Year</Label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger id="year">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="genre">Genre</Label>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger id="genre">
              <SelectValue placeholder="Select genre" />
            </SelectTrigger>
            <SelectContent>
              {GENRES.map((genre) => (
                <SelectItem key={genre.value} value={genre.value}>
                  {genre.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contentRating">Content Rating</Label>
          <Select 
            value={contentRating} 
            onValueChange={setContentRating}
            disabled={!industry}
          >
            <SelectTrigger id="contentRating">
              <SelectValue placeholder={industry ? "Select rating" : "Select industry first"} />
            </SelectTrigger>
            <SelectContent>
              {availableContentRatings.map((rating) => (
                <SelectItem key={rating.value} value={rating.value}>
                  {rating.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Finding recommendations...
            </>
          ) : (
            'Get Recommendations'
          )}
        </Button>
      </div>
    </div>
  );
}