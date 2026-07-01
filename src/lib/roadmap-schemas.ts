import { z } from 'zod';

export const TaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().default(''),
  type: z.enum(['reading', 'coding', 'assignment', 'pdf_upload', 'image_upload', 'quiz', 'research', 'github', 'website', 'video', 'custom']),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).default('easy'),
  priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
  estimated_minutes: z.number().min(1, 'Estimated minutes must be > 0'),
  xp_reward: z.number().min(0).default(10),
  coin_reward: z.number().min(0).default(0),
  submission_requirement: z.enum(['none', 'text', 'photo', 'multiple_photos', 'pdf', 'github', 'website', 'video', 'voice', 'mixed']).default('none'),
  requires_ai_verification: z.boolean().default(false),
  ai_verification_type: z.enum(['ocr', 'code_review', 'essay', 'image_analysis', 'research_summary', 'quiz_evaluation']).optional(),
  ai_verification_prompt: z.string().optional(),
});

export const ModuleSchema = z.object({
  title: z.string().min(1, 'Module title is required'),
  description: z.string().optional().default(''),
  tasks: z.array(TaskSchema).min(1, 'Module must have at least one task'),
});

export const MilestoneSchema = z.object({
  title: z.string().min(1, 'Milestone title is required'),
  description: z.string().optional().default(''),
  modules: z.array(ModuleSchema).min(1, 'Milestone must have at least one module'),
});

export const PhaseSchema = z.object({
  title: z.string().min(1, 'Phase title is required'),
  description: z.string().optional().default(''),
  milestones: z.array(MilestoneSchema).min(1, 'Phase must have at least one milestone'),
});

export const RoadmapImportSchema = z.object({
  name: z.string().min(1, 'Roadmap name is required'),
  description: z.string().optional().default(''),
  cover_image_url: z.string().url().optional(),
  version: z.number().min(1, 'Version must be >= 1'),
  duration_days: z.number().min(1, 'Duration must be >= 1 day'),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).default('medium'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  missed_strategy: z.enum(['carry_forward', 'auto_reschedule', 'mark_skipped', 'manual_recovery']).default('carry_forward'),
  phases: z.array(PhaseSchema).min(1, 'Roadmap must have at least one phase'),
});

export type RoadmapImport = z.infer<typeof RoadmapImportSchema>;
