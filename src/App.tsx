import { AppProvider, useApp } from "./context/AppContext";
import { Brand } from "./ui/Brand";
import { En } from "./ui/En";
import { ProjectCard } from "./ui/ProjectCard";
import { BeatGame } from "./games/beat/BeatGame";
import { KeyboardGame } from "./games/keyboard/KeyboardGame";
import { assetUrl } from "./lib/assets";

function Shell() {
  const { project, openProject } = useApp();
  const inGame = project !== "home";

  return (
    <main className="app-shell">
      <header className="topbar">
        <Brand>
          <span className="brand-mark" aria-hidden="true">
            🐾
          </span>
          <span>乐理小游戏</span>
          <em>V1</em>
        </Brand>
      </header>

      <section className="hero">
        <article className={`game-card app${inGame ? " in-game" : ""}`}>
          <p className="page-kicker">MUSIC THEORY GAME</p>
          <h1 className="page-title">🎵 乐理小游戏</h1>
          <p className="page-lead">认识节拍、记住音名，再把儿歌弹出来。每一次练习，都是小小的成就。</p>

          <div className={`project-select${inGame ? " hidden" : ""}`}>
            <div className="home-hero">
              <div className="illustration-stage">
                <img className="scene-frame" src={assetUrl("kitty-home.png")} alt="粉色小猫坐在钢琴前" />
                <div className="star-melody" aria-hidden="true">
                  <i>★</i>
                  <i>✦</i>
                  <i>★</i>
                </div>
              </div>
              <div className="project-grid">
                <ProjectCard
                  iconSrc={assetUrl("icon-beat.png")}
                  title={
                    <>
                      节拍游戏 <En>Beat Game</En>
                    </>
                  }
                  subtitle="认识时值 · 拍出节奏"
                  onClick={() => openProject("beat")}
                />
                <ProjectCard
                  iconSrc={assetUrl("beat-whole.png")}
                  title={
                    <>
                      我是谁？ <En>Who Am I?</En>
                    </>
                  }
                  subtitle="认识音名 · 玩转钢琴"
                  onClick={() => openProject("keyboard")}
                />
              </div>
            </div>
          </div>

          <div style={{ display: project === "beat" ? "block" : "none" }}>
            <BeatGame />
          </div>
          <KeyboardGame visible={project === "keyboard"} />
        </article>
      </section>

      <footer className="site-footer">
        <span>把每一个音符，都变成小小的成就</span>
        <span>♪</span>
      </footer>
    </main>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
