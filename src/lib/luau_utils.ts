// Thanks mstudio45 for the discord button addition :D
export function kick_script(title: string, message: string, discordBtn: boolean, discord_link: string) {
  title = title.replaceAll("\n", "\\n").replaceAll("\r", "\\r");
  message = message.replaceAll("\n", "\\n").replaceAll("\r", "\\r");

  let add_discord = ``;

  if (discordBtn) { 
      add_discord = `
kick_prompt.MessageArea.ErrorFrame:WaitForChild("ButtonArea", math.huge)
kick_prompt.MessageArea.ErrorFrame.ButtonArea:WaitForChild("ButtonLayout", math.huge)
kick_prompt.MessageArea.ErrorFrame.ButtonArea:WaitForChild("LeaveButton", math.huge)

local req = (syn and syn.request) or (http and http.request) or http_request or (fluxus and fluxus.request) or request;
if req then
  if kick_prompt.MessageArea.ErrorFrame.ButtonArea:FindFirstChild("discord") then
      kick_prompt.MessageArea.ErrorFrame.ButtonArea.discord:Destroy()
  end

  --local BTN_SIZE = 36
  --kick_prompt.Size = UDim2.new(0, 400, 0, 228 + BTN_SIZE) -- 36 is button size
  --kick_prompt.MessageArea.ErrorFrame.ButtonArea.Size = UDim2.new(1, 0, 0, BTN_SIZE * 2)
  --kick_prompt.MessageArea.ErrorFrame.Size = UDim2.new(1, 0, 0.8, 0)
  --kick_prompt.MessageArea.ErrorFrame.ButtonArea.ButtonLayout.CellPadding = UDim2.new(0, 10, 0, 10)
  kick_prompt.MessageArea.ErrorFrame.ButtonArea.ButtonLayout.CellSize = UDim2.new(0, 180, 0, 36)
  kick_prompt.MessageArea.ErrorFrame.ButtonArea.ButtonLayout.FillDirection = Enum.FillDirection.Vertical
  kick_prompt.MessageArea.ErrorFrame.ButtonArea.ButtonLayout.FillDirectionMaxCells = 2

  local joinDisBtn = kick_prompt.MessageArea.ErrorFrame.ButtonArea.LeaveButton:Clone()
  joinDisBtn.Name = "discord"
  joinDisBtn.ButtonText.Text = "Join our Discord server"
  joinDisBtn.Parent = kick_prompt.MessageArea.ErrorFrame.ButtonArea
  joinDisBtn.MouseButton1Click:Connect(function()
      req({
          Url = 'http://127.0.0.1:6463/rpc?v=1',
          Method = 'POST',
          Headers = {
              ['Content-Type'] = 'application/json',
              Origin = 'https://discord.com'
          },
          Body = game:GetService("HttpService"):JSONEncode({
              cmd = 'INVITE_BROWSER',
              nonce = game:GetService("HttpService"):GenerateGUID(false),
              args = { code = "${discord_link.replace('https://discord.gg/','').replace('http://discord.gg/','').replace('discord.gg/','')}" }
          })
      })
  end)
end`;
  }

  return `game:GetService("Players").LocalPlayer:Kick("${message}")
task.wait(.1)

-- wtf roblox why in some players its in robloxgui and some in coregui
local kick_prompt = game:GetService("CoreGui"):WaitForChild("RobloxPromptGui",0.5):WaitForChild("promptOverlay",0.5):WaitForChild("ErrorPrompt",0.5) or game:GetService("CoreGui"):WaitForChild("RobloxGui",0.5):WaitForChild("RobloxPromptGui",0.5):WaitForChild("promptOverlay",0.5):WaitForChild("ErrorPrompt",0.5);

kick_prompt:WaitForChild("TitleFrame", math.huge)
kick_prompt:WaitForChild("MessageArea", math.huge)
kick_prompt.TitleFrame:WaitForChild("ErrorTitle", math.huge)
kick_prompt.MessageArea:WaitForChild("ErrorFrame", math.huge)
kick_prompt.MessageArea.ErrorFrame:WaitForChild("ErrorMessage", math.huge)

kick_prompt.TitleFrame.ErrorTitle.Text = "${title}";
kick_prompt.MessageArea.ErrorFrame.ErrorMessage.Text = "${message}";
` + add_discord;
}