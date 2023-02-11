### Variable #######################################

DOCKER_COMPOSE_YML  :=  docker-compose.yml
DOCKER_COMPOSE_ENV  :=  .env
DOCKER_COMPOSE      :=  @docker-compose -f $(DOCKER_COMPOSE_YML) --env-file=$(DOCKER_COMPOSE_ENV)

CONTAINER_FLAG      :=  `make ps | wc -l`

_SUCCESS            :=  "\\033[32m"
_WARNING            :=  "\\033[33m"
_ERROR              :=  "\\033[31m"
_DEFAULT            :=  "\\033[0m"

_SUCCESS_LOG        :=  "\n$(_SUCCESS)[%s]$(_DEFAULT)\n"
_WARNING_LOG        :=  "\n$(_WARNING)[%s]$(_DEFAULT)\n"
_ERROR_LOG          :=  "\n$(_ERROR)[%s]$(_DEFAULT)\n"

### Phony ###########################################

.PHONY: all up down
.PHONY: clean fclean prune
.PHONY: logs ps images

### Common #########################################

all: up

up:
	@if [ $(CONTAINER_FLAG) -gt 1 ]; then \
		REPLY=""; \
		read -p "Containers is currently running. Continue process? [y/n] " -r; \
		REPLY=`echo $$REPLY | sed 's/^ *//'`; \
		if [[ ! $$REPLY =~ (^|^[Yy])$$ ]]; then \
			printf $(_WARNING_LOG) "Make worker has down"; \
			exit 0; \
		else \
			make -- --reboot; \
		fi \
	else \
		make -- --start; \
	fi

down:
	make -- --stop;

re:
	@if [ $(CONTAINER_FLAG) -gt 1 ]; then \
		SERVICES=`docker-compose ps --services`; \
		SERVICE_COUNT=`echo $$SERVICES | tr " " "\n" | wc -l | sed 's/^ *//'`; \
		SERVICE_INDEX=1; \
		REPLY=""; \
		\
		printf $(_SUCCESS_LOG) "Container list"; \
		printf "\033[1;33m  0 - All (Press 0 or only enter)\033[0m\n"; \
		for SERVICE in $$SERVICES; \
		do \
			printf "%3d - %s\n" "$$((SERVICE_INDEX++))" "$$SERVICE"; \
		done; \
		\
		printf $(_SUCCESS_LOG) "Please select the services you want to restart"; \
		printf " - Please enter a number between 0 and $$SERVICE_COUNT\n"; \
		printf " - If you select multiple services, separate them with spaces.\n"; \
		printf "$(_WARNING)\n"; \
		read -p " Select > " -r; \
		printf "$(_DEFAULT)"; \
		\
		REPLY=`echo $$REPLY | sed 's/^ *//'`; \
		REPLY_COUNT=0; \
		RESTART_CONTAINERS=""; \
		\
		for SEQUENCE in $$REPLY; \
		do \
			if [ $$SEQUENCE -eq 0 ]; then \
				RESTART_CONTAINERS=""; \
				break; \
			fi; \
			\
			REPLY_SERVICE=`echo $$SERVICES | cut -d ' ' -f$$SEQUENCE`; \
			if [[ ! $$SEQUENCE =~ (^|^[0-9]+)$$ || $$SEQUENCE -gt $$SERVICE_COUNT || $$RESTART_CONTAINERS = *$$REPLY_SERVICE* ]]; then \
				REPLY_COUNT=$$((SERVICE_COUNT + 1)); \
				break; \
			fi; \
			\
			RESTART_CONTAINERS+="$$REPLY_SERVICE "; \
			REPLY_COUNT=$$((REPLY_COUNT + 1)); \
		done; \
		\
		if [ $$REPLY_COUNT -gt $$SERVICE_COUNT ]; then \
			printf $(_ERROR_LOG) "Invalid input value"; \
			printf " - Input can be number of more than 0\n"; \
			printf " - Input number less than services count\n"; \
			printf " - Duplicate input are not allowed\n\n"; \
			exit 0; \
		fi; \
		\
		if [ "$$RESTART_CONTAINERS" == "" ]; then \
			make -- --reboot; \
		else \
			make -- --restart SERVICES="$$RESTART_CONTAINERS"; \
		fi; \
	else \
		make -- --start; \
	fi


### Clean ###########################################

clean: down
	@(docker rm -f `docker ps -aq` || true) 2> /dev/null

fclean: clean
	@(docker rmi -f `docker images -aq` || true) 2> /dev/null

prune: fclean
	@(yes | docker system prune -a) 2> /dev/null

### Util ############################################

logs:
	$(DOCKER_COMPOSE) logs --follow --timestamps

ps:
	@docker ps

images:
	@docker images

### Private Target ##################################

--start:
	$(DOCKER_COMPOSE) up --build --detach; \
	make -- --last-comment;

--stop:
	$(DOCKER_COMPOSE) down; \
	make -- --last-comment;

--restart:
	@printf $(_SUCCESS_LOG) "Will be started to build containers"; \
	printf "\n";
	$(DOCKER_COMPOSE) up --build --detach $$SERVICES; \
	make -- --last-comment;

--reboot:
	@printf $(_SUCCESS_LOG) "Will be closed existing containers"; \
	printf "\n"; \
	make -- --stop; \
	printf $(_SUCCESS_LOG) "Will be started to build containers"; \
	printf "\n"; \
	make -- --start; \

--last-comment:
	@printf $(_SUCCESS_LOG) "Process done"; \
	printf "\n";
