import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllPerfumes(req: Request, res: Response) {
  try {
    const { page = 1, limit = 10, search, categoryId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (search && typeof search === 'string') {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const perfumes = await prisma.perfume.findMany({
      skip,
      take: Number(limit),
      where,
      include: {
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.json(perfumes);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching perfumes', error });
  }
}

export async function getPerfumeById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const perfume = await prisma.perfume.findUnique({
      where: { id },
      include: {
        category: true
      }
    });

    if (!perfume) {
      return res.status(404).json({ message: 'Perfume not found' });
    }

    return res.json(perfume);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching perfume', error });
  }
}

export async function createPerfume(req: Request, res: Response) {
  try {
    const perfume = await prisma.perfume.create({
      data: req.body,
      include: {
        category: true
      }
    });

    return res.status(201).json(perfume);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating perfume', error });
  }
}

export async function updatePerfume(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const perfume = await prisma.perfume.update({
      where: { id },
      data: req.body,
      include: {
        category: true
      }
    });

    return res.json(perfume);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating perfume', error });
  }
}

export async function deletePerfume(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.perfume.delete({
      where: { id }
    });

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting perfume', error });
  }
}