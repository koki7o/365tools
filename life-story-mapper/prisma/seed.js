import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.media.deleteMany()
  await prisma.lifeEvent.deleteMany()
  await prisma.category.deleteMany()

  // Create categories
  const careerCategory = await prisma.category.create({
    data: {
      name: 'Career',
      color: '#22c55e'
    }
  })

  const personalCategory = await prisma.category.create({
    data: {
      name: 'Personal',
      color: '#3b82f6'
    }
  })

  const educationCategory = await prisma.category.create({
    data: {
      name: 'Education',
      color: '#a855f7'
    }
  })

  // Create example events
  await prisma.lifeEvent.create({
    data: {
      title: 'Career Change to Tech',
      description: 'Made the decision to transition from marketing to software development',
      date: new Date('2024-01-15'),
      location: 'Home Office',
      categoryId: careerCategory.id,
      emotions: 'excited, nervous, determined',
      people: 'Family, Mentors',
      decisionContext: 'Felt unfulfilled in marketing and noticed growing interest in technology',
      alternatives: 'Stay in marketing, pursue management role, start own business',
      outcome: 'Successfully completed coding bootcamp and landed first dev role',
      impactRating: 5,
      learnings: 'Taking calculated risks for passion can lead to fulfilling outcomes',
      seasonalTiming: 'Winter'
    }
  })

  await prisma.lifeEvent.create({
    data: {
      title: 'Moving to a New City',
      description: 'Relocated to Berlin for better opportunities',
      date: new Date('2024-03-20'),
      location: 'Berlin, Germany',
      categoryId: personalCategory.id,
      emotions: 'adventurous, optimistic',
      people: 'Friends, New Colleagues',
      decisionContext: 'Received multiple job offers and wanted cultural experience',
      alternatives: 'Stay in current city, move to London, remote work',
      outcome: 'Found great community and professional growth',
      impactRating: 4,
      learnings: 'Embracing change leads to unexpected positive experiences',
      seasonalTiming: 'Spring'
    }
  })

  await prisma.lifeEvent.create({
    data: {
      title: 'Starting Masters Program',
      description: 'Enrolled in Masters in Computer Science',
      date: new Date('2023-09-01'),
      location: 'Technical University',
      categoryId: educationCategory.id,
      emotions: 'motivated, challenged',
      people: 'Professors, Classmates',
      decisionContext: 'Wanted to deepen technical knowledge and specialize in AI',
      alternatives: 'Self-study, certifications, work experience',
      outcome: 'Gaining deep insights and valuable connections',
      impactRating: 4,
      learnings: 'Structured education provides unique networking opportunities',
      seasonalTiming: 'Fall'
    }
  })

  await prisma.lifeEvent.create({
    data: {
      title: 'Starting First Startup',
      description: 'Launched a tech startup with university friends',
      date: new Date('2024-06-15'),
      location: 'Innovation Hub',
      categoryId: careerCategory.id,
      emotions: 'excited, ambitious, focused',
      people: 'Co-founders, Mentors, First Employees',
      decisionContext: 'Identified market opportunity and had strong team',
      alternatives: 'Join established company, freelance work',
      outcome: 'Successfully raised seed funding and growing user base',
      impactRating: 5,
      learnings: 'Team chemistry and market timing are crucial for success',
      seasonalTiming: 'Summer'
    }
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
