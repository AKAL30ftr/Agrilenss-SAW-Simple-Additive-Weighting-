import type { MessageWithoutId, PhaseResult, Sapaan } from './types';
import { ringkasanMessage } from '../content/messages';

export function handleFormSubmit(formName: string, formGender: Sapaan | ''): PhaseResult {
  const name = formName.trim() || 'Petani';
  const gender = formGender || 'laki';
  const msgs: MessageWithoutId[] = [
    { role: 'user', content: `Nama: ${name}\nJenis Kelamin: ${gender === 'laki' ? 'Laki-laki' : 'Perempuan'}` },
    { role: 'assistant', content: ringkasanMessage(name, gender) },
  ];
  return { messagesToAdd: msgs, nextPhase: 'ringkasan', updateState: { userName: name, userGender: gender } };
}
