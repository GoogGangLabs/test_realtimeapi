### Variable #######################################

DOCKER_COMPOSE_YML  :=  docker-compose.yml
DOCKER_COMPOSE_ENV  :=  .env
DOCKER_COMPOSE      :=  @docker-compose -f $(DOCKER_COMPOSE_YML) --env-file=$(DOCKER_COMPOSE_ENV)

### Common #########################################

all: up

detach:
	$(DOCKER_COMPOSE) up --build --detach

up:
	$(DOCKER_COMPOSE) up --build

down:
	$(DOCKER_COMPOSE) down

### Clean ###########################################

clean: down
	@(docker rm -f `docker ps -aq` || true) 2> /dev/null

fclean: clean
	@(docker rmi -f `docker images -aq` || true) 2> /dev/null

prune: fclean
	@(yes | docker system prune -a) 2> /dev/null

### Util ############################################

log:
	$(DOCKER_COMPOSE) logs --follow --timestamps

ps:
	@docker ps

images:
	@docker images

### Phony ###########################################

.PHONY: all build daemon stop
.PHONY: clean fclean prune
.PHONY: log ps images