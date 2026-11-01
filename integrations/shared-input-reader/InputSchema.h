// Structural input checks only. No defaults are inserted and no solver is run.
#pragma once
#include "Json/json.hpp"
#include "InputSchema.generated.h"
#include <cmath>
#include <stdexcept>
#include <string>

namespace InputSchema {
using json=nlohmann::json;
inline const json& definition() { static const json spec=json::parse(specificationText()); return spec; }
inline void fail(const std::string& path,const std::string& reason) { throw std::invalid_argument("Input schema: "+path+": "+reason); }
inline void number(const json& value,const json& spec,const std::string& path,bool integer=false) {
 if(!value.is_number())fail(path,"number required");
 const double n=value.get<double>();
 if(!std::isfinite(n))fail(path,"finite number required");
 if(integer&&(std::floor(n)!=n||std::abs(n)>9007199254740991.0))fail(path,"safe integer required");
 if(spec.contains("min")&&n<spec["min"].get<double>())fail(path,"below minimum");
 if(spec.contains("max")&&n>spec["max"].get<double>())fail(path,"above maximum");
 if(spec.contains("exclusiveMin")&&n<=spec["exclusiveMin"].get<double>())fail(path,"below exclusive minimum");
 if(spec.contains("exclusiveMax")&&n>=spec["exclusiveMax"].get<double>())fail(path,"above exclusive maximum");
}
inline void walk(const json& value,const json& spec,const std::string& path) {
 const auto kind=spec.at("kind").get<std::string>();
 if(kind=="object") {
  if(!value.is_object())fail(path,"object required");
  json fields=spec.at("fields");
  if(spec.contains("variants")&&value.contains("type")&&value["type"].is_string()) {
   const auto type=value["type"].get<std::string>();
   if(spec["variants"].contains(type))for(auto it=spec["variants"][type].begin();it!=spec["variants"][type].end();++it)fields[it.key()]=it.value();
  }
  // Missing fields and unknown extensions remain the original reader's concern.
  for(auto it=fields.begin();it!=fields.end();++it)if(value.contains(it.key()))walk(value[it.key()],it.value(),path+"."+it.key());
 } else if(kind=="map"||kind=="list") {
  if(kind=="list"?!value.is_array():!value.is_object()&&!value.is_array())fail(path,"collection required");
  if(spec.contains("minItems")&&value.size()<spec["minItems"].get<std::size_t>())fail(path,"collection incomplete");
  std::size_t index=0;for(auto it=value.begin();it!=value.end();++it,++index)walk(it.value(),spec.at("item"),path+"."+(value.is_object()?it.key():std::to_string(index)));
 } else if(kind=="number"||kind=="integer")number(value,spec,path,kind=="integer");
 else if(kind=="boolean") { if(!value.is_boolean())fail(path,"boolean required"); }
 else if(kind=="string") { if(!value.is_string())fail(path,"string required"); }
 else if(kind=="choice") { bool found=false;for(const auto& option:spec.at("choices"))if(option==value)found=true;if(!found)fail(path,"unsupported option"); }
 else if(kind=="vector"||kind=="pair") {
  if(!value.is_array()||value.size()!=(kind=="pair"?2:3))fail(path,"invalid vector dimensions");
  if(kind=="pair") { for(const auto& vector:value){if(!vector.is_array()||vector.size()!=3)fail(path,"three components required");for(const auto& n:vector)number(n,spec,path);} }
  else for(const auto& n:value)number(n,spec,path,spec.value("integer",false));
 } else fail(path,"unsupported schema kind");
}
inline void validate(const json& input) {
 if(!input.is_object())fail("input","object required");
 const auto& spec=definition();
 for(auto section=spec.at("sections").begin();section!=spec.at("sections").end();++section) {
  const auto& fields=section.value().at("fields");
  for(auto field=fields.begin();field!=fields.end();++field) {
   if(input.contains(field.key()))walk(input[field.key()],field.value(),field.key());
   else if(field.key()=="material"&&input.contains("materials"))walk(input["materials"],field.value(),"materials");
  }
 }
}
}
