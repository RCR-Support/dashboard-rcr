import type { NextApiRequest, NextApiResponse } from 'next';
import * as formidable from 'formidable';
import { createActivity } from '../../../actions/activities/create-activity';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Usar formidable para manejar FormData con archivos
  const form = new formidable.IncomingForm();
  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) {
      return res.status(400).json({ error: 'Error al procesar formulario' });
    }
    try {
      const name = fields.name as string;
      const requiredDriverLicense = fields.requiredDriverLicense as string;
      const imageFile = files.image;

      // Usar la función de creación importada
      const activity = await createActivity(name, imageFile, requiredDriverLicense);
      return res.status(200).json({ activity });
    } catch (error) {
      return res.status(500).json({ error: 'Error al crear actividad' });
    }
  });
}
