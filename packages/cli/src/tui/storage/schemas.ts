import { z } from 'zod';

export const ChatMessageRoleSchema = z.enum(['user', 'assistant', 'system']);

export const ReviewDecisionSchema = z.enum(['approve', 'request_changes', 'comment']);

export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  role: ChatMessageRoleSchema,
  content: z.string().min(1),
  timestamp: z.string().datetime(),
  reviewId: z.string().uuid().optional(),
  command: z.string().optional(),
});

export const SessionMetadataSchema = z.object({
  id: z.string().uuid(),
  projectPath: z.string().min(1),
  projectName: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const SessionIndexEntrySchema = z.object({
  id: z.string().uuid(),
  projectPath: z.string().min(1),
  projectName: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  messageCount: z.number().int().min(0),
  lastReviewDecision: ReviewDecisionSchema.optional(),
});

export const SessionIndexSchema = z.object({
  sessions: z.array(SessionIndexEntrySchema),
});

export const SessionDataSchema = z.object({
  metadata: SessionMetadataSchema,
  messages: z.array(ChatMessageSchema),
});

export const MessagesArraySchema = z.array(ChatMessageSchema);

export type ChatMessageRole = z.infer<typeof ChatMessageRoleSchema>;
export type ReviewDecision = z.infer<typeof ReviewDecisionSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type SessionMetadata = z.infer<typeof SessionMetadataSchema>;
export type SessionIndexEntry = z.infer<typeof SessionIndexEntrySchema>;
export type SessionIndex = z.infer<typeof SessionIndexSchema>;
export type SessionData = z.infer<typeof SessionDataSchema>;
