import GoogleIcon from '../atoms/GoogleIcon.jsx';
import Spinner from '../atoms/Spinner.jsx';

// Molécula: botão "Continuar com o Google" (átomos GoogleIcon + Spinner sobre a superfície branca).
export function GoogleButton({ children = 'Continuar com o Google', loading = false, ...rest }) {
  return (
    <button type="button" className="btn btn-google btn-block" disabled={loading} {...rest}>
      {loading ? <Spinner /> : <GoogleIcon size={18} />}
      {children}
    </button>
  );
}

export default GoogleButton;
