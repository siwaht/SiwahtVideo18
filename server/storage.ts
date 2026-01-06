import {
  type ContactSubmission,
  type InsertContactSubmission,
} from "@shared/schema";

export interface IStorage {
  // Contact submissions - the only actively used storage methods
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  updateContactSubmission(id: string, updates: Partial<ContactSubmission>): Promise<ContactSubmission>;
}

// In-memory storage implementation for contact submissions
// Media storage is handled by media-storage.ts
class MemStorage implements IStorage {
  private contacts: ContactSubmission[] = [];

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const contact: ContactSubmission = {
      id: Math.random().toString(36).substr(2, 9),
      ...submission,
      status: "unread",
      adminNotes: null,
      company: submission.company || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.contacts.push(contact);
    return contact;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return [...this.contacts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateContactSubmission(id: string, updates: Partial<ContactSubmission>): Promise<ContactSubmission> {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) throw new Error("Contact not found");
    
    this.contacts[index] = { ...this.contacts[index], ...updates, updatedAt: new Date() };
    return this.contacts[index];
  }
}

export const storage = new MemStorage();
