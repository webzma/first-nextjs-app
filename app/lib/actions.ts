'use server'
import { sql } from '@vercel/postgres'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Esto significa que todas las funciones o acciones que se ejecuten en este archivo no se ejecutan ni se envían al cliente
import { z } from 'zod'

const createInvoiceFormSchema = z.object({
  id: z.string(), 
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
})

const createInvoiceSchema = createInvoiceFormSchema.omit({
  id: true,
  date: true,
})

export async function createInvoice(formData: FormData) {
  const { customerId, amount, status } = createInvoiceSchema.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  })

  const amountInCents = amount * 100
  const [ date ] = new Date().toISOString().split('T')

 await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `

  revalidatePath('/dashboard/invoices')
  redirect('/dashboard/invoices')
}