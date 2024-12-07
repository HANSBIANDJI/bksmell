import { Request, Response } from 'express';
import { PerfumeModel } from '../models/perfume.model';

export async function getAllPerfumes(req: Request, res: Response) {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = {
      ...(category && { categoryId: category }),
      ...(search && {
        OR: [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
        ],
      }),
    };

    const perfumes = await PerfumeModel.findAll({
      skip,
      take: Number(limit),
      where,
    });

    res.json(perfumes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching perfumes' });
  }
}

export async function getPerfumeById(req: Request, res: Response) {
  try {
    const perfume = await PerfumeModel.findById(req.params.id);
    if (!perfume) {
      return res.status(404).json({ error: 'Perfume not found' });
    }
    res.json(perfume);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching perfume' });
  }
}

export async function createPerfume(req: Request, res: Response) {
  try {
    const perfume = await PerfumeModel.create(req.body);
    res.status(201).json(perfume);
  } catch (error) {
    res.status(500).json({ error: 'Error creating perfume' });
  }
}

export async function updatePerfume(req: Request, res: Response) {
  try {
    const perfume = await PerfumeModel.update(req.params.id, req.body);
    res.json(perfume);
  } catch (error) {
    res.status(500).json({ error: 'Error updating perfume' });
  }
}

export async function deletePerfume(req: Request, res: Response) {
  try {
    await PerfumeModel.delete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting perfume' });
  }
}