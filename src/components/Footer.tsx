import {
  GithubIcon,
  DiscordIcon,
  TelegramIcon,
  TiwtterIcon,
  WechatIcon,
  YoutubeIcon,
} from "./CommunityIcon";

const year = new Date().getFullYear();

const community = [
  {
    name: "Github",
    href: "https://github.com/Dapp-Learning-DAO/Dapp-Learning",
    icon: GithubIcon,
  },
  {
    name: "Twttier",
    href: "https://twitter.com/Dapp_Learning",
    icon: TiwtterIcon,
  },
  {
    name: "Youtube",
    href: "https://www.youtube.com/c/DappLearning",
    icon: YoutubeIcon,
  },
  {
    name: "Discord",
    href: "https://discord.gg/cRYNYXqPeR",
    icon: DiscordIcon,
  },
  {
    name: "Telegram",
    href: "https://t.me/joinchat/48Mp2jy4Yw40MmI1",
    icon: TelegramIcon,
  },
  {
    name: "Wechat",
    href: "https://github.com/Dapp-Learning-DAO/Dapp-Learning/tree/main/docs/imgs/wechat-group-helper.png",
    icon: WechatIcon,
  },
];

export default function Footer() {
  return (
    <footer className="relative pt-4 pb-4 w-full bg-slate-100 dark:bg-neutral">
      <div className="container m-auto flex flex-col items-center font-light">
        <div className="flex w-[80%] mb-2 md:max-w-sm">
          {community.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex flex-col items-center rounded-lg m-auto md:p-4 fill-slate-500 stroke-slate-500 hover:fill-white hover:stroke-white hover:text-white"
            >
              <item.icon className="h-6 w-6 inherit" aria-hidden="true" />
            </a>
          ))}
        </div>
        <div className="text-slate-500 text-sm md:text-base">
          Copyright &copy; {year}
          <span aria-label="rocket emoji">🚀</span>
          Dapp-Learning
        </div>
      </div>
      {/* <BlockState /> */}
    </footer>
  );
}
