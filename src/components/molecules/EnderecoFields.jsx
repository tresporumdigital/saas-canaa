import { useRef, useState } from 'react';
import { Input, Select, FieldRow } from './Field.jsx';
import { maskCEP } from '../../lib/masks.js';
import { buscarCep } from '../../lib/cep.js';
import { UF_LIST } from '../../lib/format.js';

/**
 * Bloco de endereço dirigido por CEP: ao completar os 8 dígitos, busca o endereço
 * (ViaCEP) e trava rua/bairro/cidade/UF para edição. Se o CEP não for encontrado,
 * os campos destravam para preenchimento manual; se o CEP ficar incompleto, o
 * endereço é limpo e os campos voltam a ficar travados aguardando uma busca.
 */
export default function EnderecoFields({ value, onChange, title = 'Endereço' }) {
  const [status, setStatus] = useState(value?.logradouro ? 'found' : 'idle'); // idle | loading | found | notfound
  const buscaIdRef = useRef(0);

  const patch = (next) => onChange({ ...value, ...next });

  const onCepChange = async (e) => {
    const cep = maskCEP(e.target.value);
    const digits = cep.replace(/\D/g, '');
    const minhaBusca = ++buscaIdRef.current; // descarta respostas de buscas anteriores/obsoletas

    if (digits.length !== 8) {
      setStatus('idle');
      patch({ cep, logradouro: '', bairro: '', cidade: '', uf: '' });
      return;
    }

    setStatus('loading');
    patch({ cep });
    const res = await buscarCep(digits);
    if (minhaBusca !== buscaIdRef.current) return; // uma digitação mais nova já assumiu
    if (res && res.logradouro) {
      setStatus('found');
      patch({ cep, ...res });
    } else {
      setStatus('notfound');
      patch({ cep, logradouro: '', bairro: '', cidade: '', uf: '' });
    }
  };

  const travado = status === 'idle' || status === 'loading' || status === 'found';
  const hint = status === 'loading' ? 'Buscando endereço…'
    : status === 'notfound' ? 'CEP não encontrado — preencha o endereço manualmente.'
    : status === 'found' ? 'Endereço localizado pelo CEP.'
    : undefined;

  return (
    <div>
      {title ? <div className="card-title">{title}</div> : null}
      <FieldRow>
        <Input label="CEP" value={value.cep || ''} onChange={onCepChange} placeholder="00000-000" hint={hint} inputMode="numeric" />
        <Input label="Logradouro" value={value.logradouro || ''} onChange={(e) => patch({ logradouro: e.target.value })} disabled={travado} />
        <Input label="Número" value={value.numero || ''} onChange={(e) => patch({ numero: e.target.value })} />
        <Input label="Bairro" value={value.bairro || ''} onChange={(e) => patch({ bairro: e.target.value })} disabled={travado} />
        <Input label="Cidade" value={value.cidade || ''} onChange={(e) => patch({ cidade: e.target.value })} disabled={travado} />
        <Select label="UF" value={value.uf || ''} onChange={(e) => patch({ uf: e.target.value })} disabled={travado} options={UF_LIST} />
      </FieldRow>
    </div>
  );
}
