restorefunction(clonefunction)
restorefunction(cloneref)
local clonef = clonefunction or function(f) return function(...) return f(...) end end
local cloner = cloneref or function(r) return r end

local _req = (syn and syn.request) or (http and http.request) or http_request or (fluxus and fluxus.request) or request or function (...)
  return {
    Status = 500,
    Body = "Horrible dogwater executor (celery probably real)"
  }
end

local _restorefunction = clonef(restorefunction or function(f) return function(...) return f(...) end end)
_restorefunction(_restorefunction)
_restorefunction(clonef)
_restorefunction(cloner)

local _identify_executor = clonef(identifyexecutor or getexecutorname or function() return "unknown" end)
local req = clonef(_req)
local loadstr = clonef(loadstring)
local player = cloner(game:GetService("Players").LocalPlayer)
local _game = cloner(game)
local _get_prod_info = clonef(game:GetService("MarketplaceService").GetProductInfo)

local _debug_info = clonef(debug.info or debug.getinfo)

_restorefunction(_debug_info)
_restorefunction(islclosure)
local _islclosure = clonef(islclosure or function(f)
  local function_data = _debug_info(f).what

  return function_data == "Lua"
end)

_restorefunction(isexecutorclosure)
local _isexecutorclosure = clonef(isexecutorclosure)

_restorefunction(isfunctionhooked)
local _isfunctionhooked = clonef(isfunctionhooked)

function is_tampered_with(obj)
  if _islclosure(obj) or (_isexecutorclosure(obj) and _isfunctionhooked(obj)) then
    return true
  end
end

if (is_tampered_with(loadstring) or is_tampered_with(loadstr)) then
  assert(false, "loadstring/loadstr tampered with")
end

if (is_tampered_with(clonef) or is_tampered_with(cloner) or is_tampered_with(clonefunction) or is_tampered_with(cloneref)) then
  assert(false, "clonef/cloner/clonefunction/cloneref tampered with")
end

if (is_tampered_with(restorefunction) or is_tampered_with(restoreref) or is_tampered_with(restorefunction)) then
  assert(false, "restorefunction/restoreref/restorefunction tampered with")
end

if (is_tampered_with(req) or is_tampered_with(_req)) then
  assert(false, "req/req tampered with")
end


local response = req({
  Url = "${origin}/api/script/${script_id}",
  Method = "GET",
  Headers = {
    ["upioguard-key"] = _G.ug_key,
    ["upioguard-rbxlusername"] = player.Name,
    ["upioguard-rbxlplaceid"] = _game.PlaceId,
    ["upioguard-rbxljobid"] = _game.JobId,
    ["upioguard-rbxluserid"] = player.UserId,
    ["upioguard-rbxlgamename"] = _get_prod_info(_game.PlaceId, _game.JobId).Name:gsub("([^a-zA-Z0-9 ]+)", ""),
    ["upioguard-executor"] = _identify_executor(),
  }
})

loadstr(response.Body)()