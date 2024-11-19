'use client'

import { useState } from 'react'
import { Button } from '@gigentic-frontend/ui-kit/ui'
import { Card, CardContent, CardFooter } from '@gigentic-frontend/ui-kit/ui'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gigentic-frontend/ui-kit/ui'
import { Textarea } from '@gigentic-frontend/ui-kit/ui'
import { Input } from '@gigentic-frontend/ui-kit/ui'
import { Plus } from 'lucide-react'

export default function Component() {
  const [serviceDescription, setServiceDescription] = useState('')
  const [projectRate, setProjectRate] = useState('')
  const [availability, setAvailability] = useState('')

  const handleCreateService = () => {
    console.log('Creating Service Offering...')
    console.log('Service Description:', serviceDescription)
    console.log('Project Rate:', projectRate)
    console.log('Availability:', availability)
    console.log('Service offering created successfully.')
  }

  return (
    <div className="container mx-auto py-6 px-4 md:py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create Your Service Offering</h1>
          <p className="text-muted-foreground text-lg">
            Describe your services and set your project rate
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="description" className="text-lg font-semibold">
              Service Description
            </label>
            <Textarea
              id="service_description"
              className="min-h-[200px] resize-y"
              placeholder="Describe your services, expertise, and what you can offer to clients..."
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="rate" className="text-lg font-semibold">
              Project Rate (SOL)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                SOL
              </span>
              <Input
                id="project_rate"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="pl-12"
                value={projectRate}
                onChange={(e) => setProjectRate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="availability" className="text-lg font-semibold">
              Availability
            </label>
            <Select onValueChange={setAvailability}>
              <SelectTrigger id="availability">
                <SelectValue placeholder="Select availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full Time</SelectItem>
                <SelectItem value="part-time">Part Time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
                <SelectItem value="freelance">Freelance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="w-full" size="lg" onClick={handleCreateService}>
          <Plus className="mr-2 h-4 w-4" />
          Create Service Offering
        </Button>
      </div>
    </div>
  )
}