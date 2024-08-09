local console = loadstring(game:HttpGet("https://raw.githubusercontent.com/notpoiu/Scripts/main/utils/console/main.lua"))() -- https://docs.upio.dev/
local start_time = os.time()

local UPIOGUARD_INTERNAL_MESSAGE = console.custom_console_progressbar({
  msg = "[upioguard]: Initializing...",
  length = 4
})

UPIOGUARD_INTERNAL_MESSAGE.update_progress(1)
pcall(restorefunction, clonefunction)
pcall(restorefunction,cloneref)
local clonef = clonefunction or function(f) return function(...) return f(...) end end
local cloner = cloneref or function(r) return r end

local _req = (syn and syn.request) or (http and http.request) or http_request or (fluxus and fluxus.request) or request or function (...)
  return {
    Status = 500,
    Body = "Horrible dogwater executor (celery probably real)"
  }
end

local _restorefunction = clonef(restorefunction or function(f) return function(...) return f(...) end end)
pcall(_restorefunction,_restorefunction)
pcall(_restorefunction,clonef)
pcall(_restorefunction,cloner)

UPIOGUARD_INTERNAL_MESSAGE.update_progress(2)

local _identify_executor = clonef(identifyexecutor or getexecutorname or function() return "unknown" end)
local req = clonef(_req)
local loadstr = clonef(loadstring)
local player = cloner(game:GetService("Players").LocalPlayer)
local _game = cloner(game)

local _debug_info = clonef(debug.info or debug.getinfo)

pcall(_restorefunction,_debug_info)
pcall(_restorefunction,islclosure)
local _islclosure = clonef(islclosure or function(f)
  local function_data = _debug_info(f).what

  return function_data == "Lua"
end)

pcall(_restorefunction,isexecutorclosure)
local _isexecutorclosure = clonef(isexecutorclosure)

pcall(_restorefunction,isfunctionhooked)
local _isfunctionhooked = clonef(isfunctionhooked)

function is_tampered_with(obj)
  local success, response = pcall(function()
    if _islclosure(obj) or (_isexecutorclosure(obj) and _isfunctionhooked(obj)) then
      return true
    end

    return false
  end)

  assert(success, "[upioguard]: Error while checking if object is tampered with: " .. tostring(response))
  return response
end

UPIOGUARD_INTERNAL_MESSAGE.update_progress(3)

if (is_tampered_with(loadstring)) then
  assert(false, "loadstring/loadstr tampered with")
end

if (is_tampered_with(clonefunction) or is_tampered_with(cloneref)) then
  assert(false, "clonef/cloner/clonefunction/cloneref tampered with")
end

if (is_tampered_with(restorefunction)) then
  assert(false, "restorefunction tampered with")
end

if (is_tampered_with(req)) then
  assert(false, "request tampered with")
end

local InputService = cloner(game:GetService("UserInputService"))

local DeviceInfo = {}

pcall(function() DeviceInfo.DevicePlatform = InputService:GetPlatform(); end);
DeviceInfo.IsMobile = (DeviceInfo.DevicePlatform == Enum.Platform.Android or DeviceInfo.DevicePlatform == Enum.Platform.IOS);

local game_name = "Game Name was not found"
pcall(function()
  local game_info = game:GetService("MarketplaceService"):GetProductInfo(_game.PlaceId, _game.JobId)
  game_name = game_info.Name:gsub("([^a-zA-Z0-9 ]+)", "")
end)

UPIOGUARD_INTERNAL_MESSAGE.update_message_with_progress("[upioguard]: Connecting to servers...", 4)

local response = req({
  Url = "${origin}/api/script/${script_id}/execute",
  Method = "GET",
  Headers = {
    ["upioguard-key"] = tostring(_G.ug_key),
    ["upioguard-rbxlusername"] = tostring(player.Name),
    ["upioguard-rbxlplaceid"] = tostring(_game.PlaceId),
    ["upioguard-rbxljobid"] = tostring(_game.JobId),
    ["upioguard-rbxluserid"] = tostring(player.UserId),
    ["upioguard-rbxlgamename"] = tostring(game_name),
    ["upioguard-executor"] = tostring(_identify_executor()),
    ["upioguard-ismobile"] = tostring(DeviceInfo.IsMobile),
  }
})

loadstr(response.Body)()
UPIOGUARD_INTERNAL_MESSAGE.update_message("[upioguard]: Successfully connected to servers and checked validity in " .. (os.time() - start_time) .. " s", "rbxasset://textures/AudioDiscovery/done.png", Color3.fromRGB(51, 255, 85))