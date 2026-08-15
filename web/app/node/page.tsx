import {NODE_SAMPLES} from "@uptime/agents/node-samples";
import {Footer, Header} from "../../components/Chrome";
import {Valuer} from "../../components/Valuer";

export const metadata = {
  title: "Uptime — value a node",
};

export default function NodePage() {
  // Profiles are plain data, so they cross to the client without a fetch. The panel itself
  // runs server side, because that is where the model key lives.
  const nodes = NODE_SAMPLES.map((s) => ({
    id: s.id,
    expectation: s.expectation,
    profile: s.profile,
  }));

  return (
    <>
      <Header />
      <main className="wrap" style={{paddingTop: 54}}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <p className="spec">Valuation bay</p>
          <p className="spec">Panel · deepseek-v4-pro</p>
        </div>

        <h1 className="display display-lg" style={{marginTop: 20, maxWidth: "17ch"}}>
          Put a node in front of the panel
        </h1>

        <p className="lead" style={{marginTop: 20}}>
          Pick a node and the two agents argue about it live. Neither has seen the other&rsquo;s
          number, and only one of them has the risk checklist. The panel takes a couple of
          minutes because three model calls have to happen in order.
        </p>

        <Valuer nodes={nodes} />
      </main>
      <Footer />
    </>
  );
}
