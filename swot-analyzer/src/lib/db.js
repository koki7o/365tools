import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

export async function createSwotAnalysis(title) {
  return prisma.swotAnalysis.create({
    data: { title }
  })
}

export async function addSwotItem(analysisId, content, type) {
  const data = {
    content,
    type
  }

  switch (type) {
    case 'strength':
      data.strengthOf = { connect: { id: analysisId } }
      break
    case 'weakness':
      data.weaknessOf = { connect: { id: analysisId } }
      break
    case 'opportunity':
      data.opportunityOf = { connect: { id: analysisId } }
      break
    case 'threat':
      data.threatOf = { connect: { id: analysisId } }
      break
    default:
      throw new Error('Invalid SWOT item type')
  }

  return prisma.swotItem.create({ data })
}

export async function getSwotAnalysis(id) {
  return prisma.swotAnalysis.findUnique({
    where: { id },
    include: {
      strengths: true,
      weaknesses: true,
      opportunities: true,
      threats: true
    }
  })
}

export async function getAllSwotAnalyses() {
  return prisma.swotAnalysis.findMany({
    include: {
      strengths: true,
      weaknesses: true,
      opportunities: true,
      threats: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function deleteSwotAnalysis(id) {
  return prisma.swotAnalysis.delete({
    where: { id }
  })
}

export async function updateSwotAnalysis(id, title) {
  return prisma.swotAnalysis.update({
    where: { id },
    data: { title }
  })
}

export async function deleteSwotItem(id) {
  return prisma.swotItem.delete({
    where: { id }
  })
}
