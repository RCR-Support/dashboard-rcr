'use server';
import { createActivity } from '@/actions/activities/create-activity';
import { editActivity } from '@/actions/activities/edit-activity';
import { deleteActivity } from '@/actions/activities/delete-activity';
import { getActivityById as getActivity } from '@/actions/activities/get-activity';

export async function createActivityServer(formData: FormData) {
  const name = formData.get('name') as string;
  const requiredDriverLicense = formData.get('requiredDriverLicense') as string;
  const imageFile = formData.get('image') as File | undefined;
  if (!name) throw new Error('El nombre es obligatorio');
  const activity = await createActivity(name, imageFile, requiredDriverLicense);
  return activity;
}

export async function editActivityServer(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const requiredDriverLicense = formData.get('requiredDriverLicense') as string;
  const imageFile = formData.get('image') as File | undefined;
  if (!id || !name) throw new Error('ID y nombre son obligatorios');
  const activity = await editActivity(
    id,
    name,
    imageFile,
    requiredDriverLicense
  );
  return activity;
}

export async function deleteActivityServer(id: string) {
  if (!id) throw new Error('ID es obligatorio');
  await deleteActivity(id);
  return true;
}

export async function getActivityById(id: string) {
  if (!id) throw new Error('ID es obligatorio');
  return getActivity(id);
}
