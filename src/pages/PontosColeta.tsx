import { MapPin, Phone, Clock, ExternalLink, Info } from "lucide-react";

const pontos = [
  {
    name: "EcoPonto Shopping Center",
    address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
    phone: "(11) 3333-4444",
    hours: "Segunda a Sábado: 9h às 18h",
  },
  {
    name: "Ponto Verde Parque",
    address: "R. Augusta, 500 - Consolação, São Paulo - SP",
    phone: "(11) 2222-3333",
    hours: "Segunda a Sexta: 8h às 17h",
  },
  {
    name: "Estação Reciclagem Norte",
    address: "Av. Cruzeiro do Sul, 1200 - Santana, São Paulo - SP",
    phone: "(11) 4444-5555",
    hours: "Segunda a Domingo: 7h às 19h",
  },
  {
    name: "EcoCenter Vila Madalena",
    address: "R. Harmonia, 300 - Vila Madalena, São Paulo - SP",
    phone: "(11) 5555-6666",
    hours: "Segunda a Sábado: 10h às 20h",
  },
];

const tabelaFC = [
  { material: "Papel", valor: "2 FC por kg" },
  { material: "Plástico", valor: "3 FC por kg" },
  { material: "Vidro", valor: "1 FC por kg" },
  { material: "Metal", valor: "5 FC por kg" },
];

const PontosColeta = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pontos de Coleta</h1>
        <p className="text-sm text-muted-foreground">
          Encontre o ponto de coleta mais próximo para reciclar seus materiais e ganhar Fênix Coins.
        </p>
      </div>

      {/* How it works */}
      <div className="rounded-xl bg-accent p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 h-5 w-5 text-accent-foreground" />
          <div>
            <p className="font-semibold text-accent-foreground">Como funciona?</p>
            <p className="mb-3 text-sm text-accent-foreground/80">
              Leve seus materiais recicláveis (papel, plástico, vidro, metal) aos pontos de coleta para ganhar Fênix Coins e trocar por produtos e benefícios.
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {tabelaFC.map((item) => (
                <div key={item.material} className="text-sm text-accent-foreground">
                  <span className="font-medium">• {item.material}:</span>{" "}
                  <span className="tabular-nums">{item.valor}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collection Points Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {pontos.map((ponto) => (
          <div key={ponto.name} className="rounded-xl bg-card p-6 shadow-card transition-shadow hover:shadow-card-hover">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              {ponto.name}
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Endereço</p>
                  <p className="text-muted-foreground">{ponto.address}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Telefone</p>
                  <p className="text-muted-foreground">{ponto.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Horário de Funcionamento</p>
                  <p className="text-muted-foreground">{ponto.hours}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
                <ExternalLink className="h-4 w-4" />
                Ver no Mapa
              </button>
              <button className="flex items-center justify-center rounded-lg border border-border p-2.5 transition-colors hover:bg-accent">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="rounded-xl bg-card p-6 shadow-card">
        <h2 className="mb-4 font-semibold text-foreground">Dicas Importantes</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold text-primary">Preparação dos Materiais:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Lave embalagens antes de levar</li>
              <li>• Remova tampas e rótulos quando possível</li>
              <li>• Separe por tipo de material</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-primary">O que levar:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Documento com foto</li>
              <li>• Materiais limpos e separados</li>
              <li>• Sacolas para organizar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PontosColeta;
