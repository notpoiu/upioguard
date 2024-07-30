-- we loadstring this script
-- _G.ug_key = "your key"
local req = (syn and syn.request) or (http and http.request) or http_request or (fluxus and fluxus.request) or request 

local response = req({
  Url = "https://upioguard.vercel.app/api/script",
  Method = "GET",
  Headers = {
    ["user-upioguard-key"] = _G.ug_key
  }
})

loadstring(response.Body)()